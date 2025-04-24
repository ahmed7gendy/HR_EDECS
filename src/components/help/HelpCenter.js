import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const faqs = [
  {
    question: 'How do I submit a leave request?',
    answer: 'To submit a leave request, navigate to the Leaves section and click on "Request Leave". Fill out the required information including the type of leave, start date, end date, and reason. Submit the form and wait for approval from your manager.'
  },
  {
    question: 'How can I view my attendance record?',
    answer: 'You can view your attendance record by going to the Attendance section. The system shows your daily check-in/check-out times, total working hours, and any late arrivals or early departures.'
  },
  {
    question: 'How do I update my profile information?',
    answer: 'To update your profile information, click on your profile picture in the top right corner and select "Profile". You can edit your personal information, contact details, and other relevant information.'
  },
  {
    question: 'How do I apply for a job opening?',
    answer: 'To apply for a job opening, go to the Recruitment section and browse available positions. Click on the job you\'re interested in and select "Apply Now". Fill out the application form and submit your resume.'
  },
  {
    question: 'How can I access my payslip?',
    answer: 'Your payslips are available in the Payroll section. Navigate to Payroll and click on "View Payslips". You can view and download your current and past payslips.'
  }
];

export default function HelpCenter() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('faq');
  const [supportTicket, setSupportTicket] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      await addDoc(collection(db, 'supportTickets'), {
        ...supportTicket,
        userId: currentUser.uid,
        status: 'open',
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
      setSupportTicket({ subject: '', message: '', priority: 'medium' });
    } catch (error) {
      setError('Failed to submit support ticket. Please try again.');
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Help Center</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Get help and support for using the system.</p>
          </div>
          <div className="border-t border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`${
                    activeTab === 'faq'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  FAQs
                </button>
                <button
                  onClick={() => setActiveTab('support')}
                  className={`${
                    activeTab === 'support'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  Contact Support
                </button>
              </nav>
            </div>

            {activeTab === 'faq' ? (
              <div className="px-4 py-5 sm:p-6">
                <dl className="space-y-6 divide-y divide-gray-200">
                  {faqs.map((faq, index) => (
                    <div key={index} className="pt-6">
                      <dt className="text-lg font-medium text-gray-900">{faq.question}</dt>
                      <dd className="mt-2 text-base text-gray-500">{faq.answer}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <div className="px-4 py-5 sm:p-6">
                {submitted ? (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Support ticket submitted</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>We'll get back to you as soon as possible.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        id="subject"
                        required
                        value={supportTicket.subject}
                        onChange={(e) => setSupportTicket({ ...supportTicket, subject: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={supportTicket.priority}
                        onChange={(e) => setSupportTicket({ ...supportTicket, priority: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        required
                        value={supportTicket.message}
                        onChange={(e) => setSupportTicket({ ...supportTicket, message: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Submit Ticket
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 