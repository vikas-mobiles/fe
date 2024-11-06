const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('products.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    console.log('Received order data:', req.body);
    const order = new Order(req.body);
    const newOrder = await order.save();
    console.log('New order created:', newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    // Decrease stock for each product in the order
    for (const item of updatedOrder.products) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};