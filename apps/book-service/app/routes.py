from flask import Blueprint, jsonify, request
from app import db
from app.models import Book

api = Blueprint('api', __name__)

@api.route('/health')
def health():
    return jsonify({'status': 'healthy', 'service': 'book-service'}), 200

@api.route('/api/books', methods=['GET'])
def get_books():
    books = Book.query.all()
    return jsonify([book.to_dict() for book in books]), 200

@api.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    book = Book.query.get_or_404(book_id)
    return jsonify(book.to_dict()), 200

@api.route('/api/books', methods=['POST'])
def create_book():
    data = request.get_json()

    if not data or not all(k in data for k in ['title', 'author', 'price', 'isbn']):
        return jsonify({'error': 'Missing required fields: title, author, price, isbn'}), 400

    if Book.query.filter_by(isbn=data['isbn']).first():
        return jsonify({'error': 'Book with this ISBN already exists'}), 409

    book = Book(
        title=data['title'],
        author=data['author'],
        price=data['price'],
        isbn=data['isbn']
    )
    db.session.add(book)
    db.session.commit()
    return jsonify(book.to_dict()), 201

@api.route('/api/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    book = Book.query.get_or_404(book_id)
    data = request.get_json()

    book.title = data.get('title', book.title)
    book.author = data.get('author', book.author)
    book.price = data.get('price', book.price)

    db.session.commit()
    return jsonify(book.to_dict()), 200

@api.route('/api/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    return jsonify({'message': 'Book deleted successfully'}), 200
