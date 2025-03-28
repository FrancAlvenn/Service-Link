import { ArrowLeft } from '@phosphor-icons/react';
import React from 'react';

function PrivacyPolicy({ onClose }) {
    return (
        <div className="fixed top-0 right-0 w-full max-w-[750px] h-full bg-white dark:bg-gray-900 dark:text-gray-100 z-100 p-6 overflow-y-auto">
            <div className="flex flex-col justify-between items-start mb-6 w-full">
                <div className="flex items-center justify-between w-full">
                    <div className="p-1 rounded-md bg-gray-500 dark:bg-gray-700 mb-3">
                        <ArrowLeft size={24} color="white" className="cursor-pointer" onClick={onClose} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Privacy Policy</h2>
            </div>

            <div className="text-gray-700 dark:text-gray-300 text-sm space-y-4">
                <p className="text-gray-700 dark:text-gray-100" >
                    <strong>Effective Date:</strong> March 2025
                </p>

                <p className="text-gray-700 dark:text-gray-100" >
                    Dr. Yanga’s Colleges Inc. (DYCI) is committed to protecting the privacy and security of all users 
                    interacting with the General Services Office (GSO) Request Management System. This Privacy Policy 
                    outlines how we collect, use, and safeguard your personal information.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">1. Information We Collect</h3>
                <p className="text-gray-700 dark:text-gray-100" >When you use the GSO Request Management System, we may collect the following types of information:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Personal Information:</strong> Name, employee or student ID, contact details (email, phone number).</li>
                    <li><strong>Request Details:</strong> Information related to job, asset, purchasing, venue, or vehicle requests.</li>
                    <li><strong>System Usage Data:</strong> Log details such as request timestamps, approvals, and transaction history.</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">2. How We Use Your Information</h3>
                <p className="text-gray-700 dark:text-gray-100" >The collected data is used to:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>Process and track requests efficiently.</li>
                    <li>Communicate updates regarding requests and approvals.</li>
                    <li>Enhance the system’s security and functionality.</li>
                    <li>Comply with institutional policies and government regulations.</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">3. Data Protection and Security</h3>
                <p className="text-gray-700 dark:text-gray-100" >
                    We implement strict security measures to protect your personal information, including data encryption 
                    and access restrictions. Only authorized personnel within DYCI’s General Services Office can access 
                    request records as necessary.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">4. Sharing of Information</h3>
                <p className="text-gray-700 dark:text-gray-100" >Your personal information is not shared with third parties except:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>When required by law or government authorities.</li>
                    <li>For internal institutional purposes to improve operational efficiency.</li>
                    <li>With your explicit consent for specific services.</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">5. User Rights</h3>
                <p className="text-gray-700 dark:text-gray-100">As a user, you have the right to:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>Access and review your submitted requests.</li>
                    <li>Request corrections to inaccurate or incomplete data.</li>
                    <li>Request the deletion of your data, subject to institutional policies.</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">6. Changes to This Policy</h3>
                <p className="text-gray-700 dark:text-gray-100">
                    DYCI reserves the right to update this Privacy Policy at any time. Users will be notified of significant 
                    changes via system announcements or email notifications.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">7. Contact Information</h3>
                <p className="text-gray-700 dark:text-gray-100">
                    For questions or concerns regarding this Privacy Policy, please contact the General Services Office 
                    at <strong>gso@dyci.edu.ph</strong> or visit our office at Dr. Yanga’s Colleges Inc.
                </p>
            </div>
        </div>
    );
}

export default PrivacyPolicy;
