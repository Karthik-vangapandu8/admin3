import React, { useState, useEffect } from 'react';
import './ManageOrders.css'

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10); // Number of orders per page
  const [searchTerm, setSearchTerm] = useState('');
  const [idSearch, setIdSearch] = useState(''); // New state for ID search
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let url = 'http://localhost:8000/orders?';
        if (searchTerm) url += `customerName=${searchTerm}&`;
        if (statusFilter) url += `status=${statusFilter}&`;
        if (idSearch) url += `id=${idSearch}&`; // Add ID search to the URL

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [searchTerm, idSearch, statusFilter]);

  // Handle order status update
  const handleUpdateStatus = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:8000/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updateStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      const updatedOrder = await response.json();
      setOrders(orders.map(order => order.id === orderId ? updatedOrder.order : order));
      setUpdateStatus('');
      setSelectedOrder(null);
    } catch (error) {
      setError(error.message);
    }
  };

  // Calculate the index of the first and last order on the current page
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Function to handle page changes
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleNextPage = () => {
    if (currentPage < Math.ceil(orders.length / ordersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>Error loading orders: {error}</p>;

  return (
    <div className="content">
      <h2>Manage Orders</h2>

      {/* Search and Filter */}
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search by customer name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by order ID"
          value={idSearch}
          onChange={(e) => setIdSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <p>No orders to display.</p>
      ) : (
        <>
          <table className="order-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
                <th>Date</th>
                <th>Delivery Address</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) =>
                order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price}</td>
                    <td>₹{(item.quantity * parseFloat(item.price.slice(1))).toFixed(2)}</td>
                    <td>{new Date(order.date).toLocaleString()}</td>
                    <td>{order.deliveryAddress || 'N/A'}</td>
                    <td>{order.timeSlot || 'N/A'}</td>
                    <td>{order.status}</td>
                    <td>
                      <button onClick={() => {
                        setSelectedOrder(order.id);
                        setUpdateStatus(order.status === 'Pending' ? 'Processing' : 'Delivered');
                      }}>
                        {order.status === 'Pending' ? 'Mark as Processing' : 'Mark as Delivered'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {selectedOrder && (
            <div className="update-status">
              <h3>Update Order Status</h3>
              <button onClick={() => handleUpdateStatus(selectedOrder)}>Update Status</button>
            </div>
          )}

          <div className="pagination">
            <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
            {Array.from({ length: Math.ceil(orders.length / ordersPerPage) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={i + 1 === currentPage ? 'active' : ''}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={handleNextPage} disabled={currentPage === Math.ceil(orders.length / ordersPerPage)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

export default ManageOrders;
