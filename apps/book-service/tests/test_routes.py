import pytest
import os

# Set test DB BEFORE importing app
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'

from app import create_app, db

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client

def test_health(client):
    response = client.get('/health')
    assert response.status_code == 200
    assert response.get_json()['status'] == 'healthy'

def test_create_book(client):
    book_data = {
        'title': 'The DevOps Handbook',
        'author': 'Gene Kim',
        'price': 29.99,
        'isbn': '9781942788003'
    }
    response = client.post('/api/books', json=book_data)
    assert response.status_code == 201
    assert response.get_json()['title'] == 'The DevOps Handbook'

def test_get_books(client):
    book_data = {
        'title': 'Site Reliability Engineering',
        'author': 'Betsy Beyer',
        'price': 35.00,
        'isbn': '9781491929124'
    }
    client.post('/api/books', json=book_data)
    response = client.get('/api/books')
    assert response.status_code == 200
    assert len(response.get_json()) == 1

def test_duplicate_isbn(client):
    book_data = {
        'title': 'Book One',
        'author': 'Author',
        'price': 10.00,
        'isbn': '1234567890123'
    }
    client.post('/api/books', json=book_data)
    response = client.post('/api/books', json=book_data)
    assert response.status_code == 409
