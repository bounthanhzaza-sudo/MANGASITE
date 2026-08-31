import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import mysql.connector
from dotenv import load_dotenv
import uuid
from werkzeug.utils import secure_filename

# --- Initial Setup ---
load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# สร้างโฟลเดอร์ uploads หากยังไม่มี
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# เปิดใช้งาน CORS รองรับทุก Route เพื่อป้องกันปัญหาการโหลดภาพและเรียก API
CORS(app, resources={r"/*": {"origins": "*"}})

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "manga_db"),
            port=int(os.getenv("DB_PORT", 3306))
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

def normalize_cover_url(filename):
    if not filename:
        return ""
    if filename.startswith("http://") or filename.startswith("https://"):
        return filename
    return f"/uploads/{filename}"


@app.route('/api/manga/<int:manga_id>', methods=['GET'])
def get_manga_detail(manga_id):
    """Endpoint สำหรับดึงข้อมูลมังงะรายเรื่องพร้อมรายการตอน"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, title, description, status, category, cover_image_url, genre FROM mangas WHERE id = %s", (manga_id,))
        manga = cursor.fetchone()

        if not manga:
            return jsonify({"error": "Manga not found"}), 404

        manga['coverUrl'] = normalize_cover_url(manga.get('cover_image_url'))
        manga.pop('cover_image_url', None)

        if not manga.get('genre'):
            manga['genre'] = 'Action'

        cursor.execute(
            "SELECT id, chapter_number FROM chapters WHERE manga_id = %s ORDER BY id ASC",
            (manga_id,)
        )
        raw_chapters = cursor.fetchall()
        manga['chapters'] = [{"id": chap['id'], "title": chap['chapter_number']} for chap in raw_chapters]

        return jsonify(manga), 200
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/manga/add_with_image', methods=['POST'])
def add_manga_with_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file part in the request"}), 400

    image_file = request.files['image']
    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    status = request.form.get('status', 'ongoing').strip() or 'ongoing'
    category = request.form.get('category', 'manga').strip() or 'manga'
    genre = request.form.get('genre', 'Action').strip() or 'Action'

    if not title:
        return jsonify({"error": "Title is required"}), 400

    if image_file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    save_path = ""
    if image_file and allowed_file(image_file.filename):
        original_filename = secure_filename(image_file.filename)
        extension = original_filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{extension}"
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        image_file.save(save_path)
    else:
        return jsonify({"error": "File type not allowed"}), 400

    conn = get_db_connection()
    if not conn:
        if os.path.exists(save_path):
            os.remove(save_path)
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    sql = """
        INSERT INTO mangas (title, cover_image_url, category, status, description, genre)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    try:
        cursor.execute(sql, (title, unique_filename, category, status, description, genre))
        conn.commit()
        manga_id = cursor.lastrowid

        return jsonify({
            "message": "Manga added successfully!",
            "manga_id": manga_id,
            "filename": unique_filename,
            "coverUrl": normalize_cover_url(unique_filename)
        }), 201
    except mysql.connector.Error as err:
        conn.rollback()
        if os.path.exists(save_path):
            os.remove(save_path)
        return jsonify({"error": f"Database error: {err}"}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/manga/<int:manga_id>/add_chapter', methods=['POST'])
def add_chapter(manga_id):
    chapter_number = request.form.get('chapter_number')

    if not chapter_number:
        return jsonify({"error": "Chapter number is required"}), 400

    if 'images' not in request.files:
        return jsonify({"error": "No image files provided"}), 400

    files = request.files.getlist('images')

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = conn.cursor()
    saved_paths = []
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS chapter_pages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                chapter_id INT NOT NULL,
                image_url VARCHAR(255) NOT NULL,
                page_order INT DEFAULT 0
            )
            """
        )

        cursor.execute(
            "INSERT INTO chapters (manga_id, chapter_number) VALUES (%s, %s)",
            (manga_id, chapter_number)
        )
        chapter_id = cursor.lastrowid

        for index, file in enumerate(files):
            if file and allowed_file(file.filename):
                original_filename = secure_filename(file.filename)
                extension = original_filename.rsplit('.', 1)[1].lower()
                unique_filename = f"{uuid.uuid4()}.{extension}"
                save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                
                file.save(save_path)
                saved_paths.append(save_path)

                cursor.execute(
                    "INSERT INTO chapter_pages (chapter_id, image_url, page_order) VALUES (%s, %s, %s)",
                    (chapter_id, unique_filename, index + 1)
                )

        conn.commit()
        return jsonify({"message": "Chapter and pages added successfully!", "chapter_id": chapter_id}), 201
    except mysql.connector.Error as err:
        conn.rollback()
        for path in saved_paths:
            if os.path.exists(path):
                os.remove(path)
        print(f"Database Error in add_chapter: {err}")
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/manga/<int:manga_id>/chapters', methods=['GET'])
def get_manga_chapters(manga_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, chapter_number FROM chapters WHERE manga_id = %s ORDER BY id ASC", (manga_id,))
        chapters = cursor.fetchall()
        return jsonify(chapters), 200
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/chapter/<int:chapter_id>', methods=['GET'])
def get_chapter(chapter_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, manga_id, chapter_number FROM chapters WHERE id = %s", (chapter_id,))
        chapter = cursor.fetchone()
        
        if not chapter:
            return jsonify({"error": "Chapter not found"}), 404
            
        cursor.execute(
            """
            SELECT image_url FROM chapter_pages 
            WHERE chapter_id = %s 
            ORDER BY page_order ASC
            """, 
            (chapter_id,)
        )
        pages_raw = cursor.fetchall()

        page_urls = [normalize_cover_url(p['image_url']) for p in pages_raw]
         
        return jsonify({
            "id": chapter['id'],
            "manga_id": chapter['manga_id'],
            "chapter_number": chapter['chapter_number'],
            "pages": page_urls
        }), 200
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/api/chapter/<int:chapter_id>', methods=['DELETE'])
def delete_chapter(chapter_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT image_url FROM chapter_pages WHERE chapter_id = %s", (chapter_id,))
        pages = cursor.fetchall()
        
        for page in pages:
            filename = page['image_url']
            if filename:
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
                    
        cursor.execute("DELETE FROM chapter_pages WHERE chapter_id = %s", (chapter_id,))
        cursor.execute("DELETE FROM chapters WHERE id = %s", (chapter_id,))
        
        conn.commit()
        return jsonify({"message": "Chapter deleted successfully!"}), 200
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"error": f"Database error: {err}"}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/manga/<int:manga_id>', methods=['DELETE'])
def delete_manga(manga_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT cover_image_url FROM mangas WHERE id = %s", (manga_id,))
        manga = cursor.fetchone()
        if manga and manga['cover_image_url']:
            cover_path = os.path.join(app.config['UPLOAD_FOLDER'], manga['cover_image_url'])
            if os.path.exists(cover_path):
                os.remove(cover_path)

        cursor.execute("""
            SELECT cp.image_url FROM chapter_pages cp
            JOIN chapters c ON cp.chapter_id = c.id
            WHERE c.manga_id = %s
        """, (manga_id,))
        pages = cursor.fetchall()
        for page in pages:
            filename = page['image_url']
            if filename:
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                if os.path.exists(file_path):
                    os.remove(file_path)

        cursor.execute("""
            DELETE cp FROM chapter_pages cp
            JOIN chapters c ON cp.chapter_id = c.id
            WHERE c.manga_id = %s
        """, (manga_id,))
        
        cursor.execute("DELETE FROM chapters WHERE manga_id = %s", (manga_id,))
        cursor.execute("DELETE FROM mangas WHERE id = %s", (manga_id,))
        
        conn.commit()
        return jsonify({"message": "Manga deleted successfully!"}), 200
    except mysql.connector.Error as err:
        conn.rollback()
        print(f"Database Error in delete_manga: {err}")
        return jsonify({"error": f"Database error: {err}"}), 500
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)