import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Select, message } from 'antd';
import '../styles/RegisterPage.css';
import { API_URL } from '../config';

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    const { name, email, password, role } = values;

    try {
      const response = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
        role,
      });

      if (response.data.success) {
        message.success('Registration successful! Redirecting to login...');
        navigate('/login');
      } else {
        message.error(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      message.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <Form
        layout="vertical"
        onFinish={onFinish}
        className="register-form"
        requiredMark={false}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter your name!' }]}
        >
          <Input placeholder="Enter your name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input placeholder="Enter your email" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter your password!' }]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: 'Please select your role!' }]}
        >
          <Select placeholder="Select your role">
            <Select.Option value="user">User</Select.Option>
            <Select.Option value="employer">Employer</Select.Option>
            <Select.Option value="admin">Admin</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="register-button"
            loading={loading}
          >
            Register
          </Button>
        </Form.Item>
      </Form>

      <div className="redirect-link">
        <p>
          Already have an account?{' '} <Link to="/login" className="login-link">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;