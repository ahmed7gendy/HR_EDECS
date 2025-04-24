import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Select, DatePicker, InputNumber, message } from 'antd';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import dayjs from 'dayjs';

const { Option } = Select;

const PayrollForm = ({ isEdit }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [payroll, setPayroll] = useState(null);

  useEffect(() => {
    if (isEdit && id) {
      fetchPayroll();
    }
  }, [isEdit, id]);

  const fetchPayroll = async () => {
    try {
      const docRef = doc(db, 'payrolls', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPayroll(data);
        form.setFieldsValue({
          ...data,
          payPeriod: data.payPeriod ? dayjs(data.payPeriod) : null,
        });
      }
    } catch (error) {
      message.error('Failed to fetch payroll details');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payrollData = {
        ...values,
        payPeriod: values.payPeriod.toDate(),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (isEdit) {
        await updateDoc(doc(db, 'payrolls', id), payrollData);
        message.success('Payroll updated successfully');
      } else {
        const docRef = doc(collection(db, 'payrolls'));
        await setDoc(docRef, { ...payrollData, id: docRef.id });
        message.success('Payroll created successfully');
      }
      navigate('/payroll');
    } catch (error) {
      message.error('Failed to save payroll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? 'Edit Payroll' : 'Create New Payroll'}
      </h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          status: 'pending',
          paymentMethod: 'bank_transfer',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="employeeId"
            label="Employee"
            rules={[{ required: true, message: 'Please select an employee' }]}
          >
            <Select placeholder="Select employee">
              {/* Employee options will be populated from database */}
            </Select>
          </Form.Item>

          <Form.Item
            name="payPeriod"
            label="Pay Period"
            rules={[{ required: true, message: 'Please select pay period' }]}
          >
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="basicSalary"
            label="Basic Salary"
            rules={[{ required: true, message: 'Please enter basic salary' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="overtimePay"
            label="Overtime Pay"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="bonuses"
            label="Bonuses"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="deductions"
            label="Deductions"
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label="Payment Method"
            rules={[{ required: true, message: 'Please select payment method' }]}
          >
            <Select>
              <Option value="bank_transfer">Bank Transfer</Option>
              <Option value="cash">Cash</Option>
              <Option value="check">Check</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="paid">Paid</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item>
          <div className="flex justify-end space-x-4">
            <Button onClick={() => navigate('/payroll')}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PayrollForm; 