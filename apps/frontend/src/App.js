import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BOOK_API = process.env.REACT_APP_BOOK_API || 'http://localhost:5000';
const ORDER_API = process.env.REACT_APP_ORDER_API || 'http://localhost:3001';

function App() {
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('books');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Book form state
  const [newBook, setNewBook] = useState({ title: '', author: '', price: '', isbn: '' });

  // Order form state
  const [newOrder, setNewOrder] = useState({ bookId: '', customerEmail: '', quantity: 1 });

  useEffect(() => {
    fetchBooks();
    fetchOrders();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BOOK_API}/api/books`);
      setBooks(res.data);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${ORDER_API}/api/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const addBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BOOK_API}/api/books`, {
        ...newBook,
        price: parseFloat(newBook.price)
      });
      setNewBook({ title: '', author: '', price: '', isbn: '' });
      setMessage('Book added successfully!');
      fetchBooks();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to add book');
    }
  };

  const deleteBook = async (id) => {
    try {
      await axios.delete(`${BOOK_API}/api/books/${id}`);
      setMessage('Book deleted!');
      fetchBooks();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to delete book');
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    try {
      const book = books.find(b => b.id === parseInt(newOrder.bookId));
      await axios.post(`${ORDER_API}/api/orders`, {
        bookId: parseInt(newOrder.bookId),
        customerEmail: newOrder.customerEmail,
        quantity: parseInt(newOrder.quantity),
        totalPrice: book ? book.price * parseInt(newOrder.quantity) : 0
      });
      setNewOrder({ bookId: '', customerEmail: '', quantity: 1 });
      setMessage('Order placed successfully!');
      fetchOrders();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to place order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">DevOps Bookstore</h1>
          <p className="text-blue-200 mt-1">Microservices Demo Application</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('books')}
            className={`py-2 px-4 font-medium ${activeTab === 'books' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Books ({books.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-4 font-medium ${activeTab === 'orders' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Books Tab */}
        {activeTab === 'books' && (
          <div>
            {/* Add Book Form */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Add New Book</h2>
              <form onSubmit={addBook} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Title" required value={newBook.title}
                  onChange={e => setNewBook({...newBook, title: e.target.value})}
                  className="border rounded px-3 py-2" />
                <input type="text" placeholder="Author" required value={newBook.author}
                  onChange={e => setNewBook({...newBook, author: e.target.value})}
                  className="border rounded px-3 py-2" />
                <input type="number" placeholder="Price" required step="0.01" value={newBook.price}
                  onChange={e => setNewBook({...newBook, price: e.target.value})}
                  className="border rounded px-3 py-2" />
                <input type="text" placeholder="ISBN (13 digits)" required value={newBook.isbn}
                  onChange={e => setNewBook({...newBook, isbn: e.target.value})}
                  className="border rounded px-3 py-2" />
                <button type="submit" className="md:col-span-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Add Book
                </button>
              </form>
            </div>

            {/* Books List */}
            <div className="bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold p-6 pb-3">Book Catalog</h2>
              {loading ? (
                <p className="p-6 text-gray-500">Loading...</p>
              ) : books.length === 0 ? (
                <p className="p-6 text-gray-500">No books yet. Add one above!</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4">Title</th>
                      <th className="text-left p-4">Author</th>
                      <th className="text-left p-4">Price</th>
                      <th className="text-left p-4">ISBN</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map(book => (
                      <tr key={book.id} className="border-t hover:bg-gray-50">
                        <td className="p-4">{book.title}</td>
                        <td className="p-4">{book.author}</td>
                        <td className="p-4">${book.price.toFixed(2)}</td>
                        <td className="p-4 text-sm text-gray-500">{book.isbn}</td>
                        <td className="p-4">
                          <button onClick={() => deleteBook(book.id)}
                            className="text-red-600 hover:text-red-800">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {/* Place Order Form */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Place New Order</h2>
              <form onSubmit={placeOrder} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select required value={newOrder.bookId}
                  onChange={e => setNewOrder({...newOrder, bookId: e.target.value})}
                  className="border rounded px-3 py-2">
                  <option value="">Select a book</option>
                  {books.map(book => (
                    <option key={book.id} value={book.id}>{book.title} - ${book.price}</option>
                  ))}
                </select>
                <input type="email" placeholder="Customer Email" required value={newOrder.customerEmail}
                  onChange={e => setNewOrder({...newOrder, customerEmail: e.target.value})}
                  className="border rounded px-3 py-2" />
                <input type="number" placeholder="Quantity" min="1" value={newOrder.quantity}
                  onChange={e => setNewOrder({...newOrder, quantity: e.target.value})}
                  className="border rounded px-3 py-2" />
                <button type="submit" className="md:col-span-3 bg-green-600 text-white py-2 rounded hover:bg-green-700">
                  Place Order
                </button>
              </form>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold p-6 pb-3">Order History</h2>
              {orders.length === 0 ? (
                <p className="p-6 text-gray-500">No orders yet.</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4">Order ID</th>
                      <th className="text-left p-4">Book ID</th>
                      <th className="text-left p-4">Customer</th>
                      <th className="text-left p-4">Qty</th>
                      <th className="text-left p-4">Total</th>
                      <th className="text-left p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-t hover:bg-gray-50">
                        <td className="p-4 text-sm">{order.id?.substring(0, 8)}...</td>
                        <td className="p-4">{order.book_id}</td>
                        <td className="p-4">{order.customer_email}</td>
                        <td className="p-4">{order.quantity}</td>
                        <td className="p-4">${parseFloat(order.total_price || 0).toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-sm ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-4 mt-12">
        <p>DevOps Bookstore - Built with Flask, Express, React | Deployed on GKE</p>
      </footer>
    </div>
  );
}

export default App;
