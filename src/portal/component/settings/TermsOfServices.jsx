import React from 'react';
import { ArrowLeft } from 'react-feather';

function TermsOfServices({ onClose }) {
    return (
        <div className="fixed top-0 right-0 w-full max-w-[750px] h-full bg-white dark:bg-gray-900 dark:text-gray-100 z-100 p-6 overflow-y-auto border-l border-gray-200 dark:border-gray-700">
            <div className="flex flex-col justify-between items-start mb-6 w-full">
                <div className="flex items-center justify-between w-full">
                    <div className="p-1 rounded-md bg-gray-500 dark:bg-gray-700 mb-3">
                        <ArrowLeft size={24} color="white" className="cursor-pointer" onClick={onClose} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Terms of Service</h2>
            </div>

            <div className="text-gray-700 dark:text-gray-100 text-sm space-y-4">
                <p className="text-gray-700 dark:text-gray-100"><strong>Effective Date:</strong> March 2025</p>

                <p className="text-gray-700 dark:text-gray-100">
                    Welcome to the General Services Office (GSO) Request Management System of Dr. Yanga’s Colleges Inc. (DYCI). 
                    By accessing and using this system, you agree to comply with the following Terms of Service. Please read them carefully.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">1. System Usage</h3>
                <p className="text-gray-700 dark:text-gray-100">The GSO Request Management System is intended for authorized users of DYCI, including employees and students, for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>Submitting job, asset, purchasing, venue, and vehicle requests.</li>
                    <li>Tracking the status of submitted requests.</li>
                    <li>Receiving official updates from the General Services Office.</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">2. User Responsibilities</h3>
                <p className="text-gray-700 dark:text-gray-100">By using this system, you agree to:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>Provide accurate and truthful information when submitting requests.</li>
                    <li>Use the system responsibly and only for its intended purposes.</li>
                    <li>Not engage in any activity that disrupts or compromises system security.</li>
                    <li>Keep login credentials confidential and report any unauthorized access.</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">3. Data Privacy</h3>
                <p className="text-gray-700 dark:text-gray-100">
                    All user data collected through this system is protected under the DYCI Privacy Policy. Personal information 
                    will only be used for processing requests and maintaining records in compliance with institutional policies.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">4. System Availability</h3>
                <p className="text-gray-700 dark:text-gray-100">
                    DYCI aims to ensure the continuous availability of this system. However, the institution reserves the right 
                    to perform maintenance, updates, or temporary shutdowns without prior notice.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">5. Prohibited Activities</h3>
                <p className="text-gray-700 dark:text-gray-100">Users are strictly prohibited from engaging in the following activities:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>Submitting false or misleading requests.</li>
                    <li>Attempting to access unauthorized sections of the system.</li>
                    <li>Using the system for personal gain or commercial purposes.</li>
                    <li>Disrupting system operations through hacking or other means.</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">6. Violation of Terms</h3>
                <p className="text-gray-700 dark:text-gray-100">
                    Any violation of these terms may result in disciplinary action, suspension of system access, or further 
                    actions as deemed necessary by DYCI’s administration.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">7. Changes to Terms</h3>
                <p className="text-gray-700 dark:text-gray-100">
                    DYCI reserves the right to update these Terms of Service at any time. Continued use of the system 
                    after changes are made constitutes acceptance of the revised terms.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">8. Contact Information</h3>
                <p className="text-gray-700 dark:text-gray-100">
                    For inquiries regarding these terms, please contact the General Services Office at 
                    <strong> gso@dyci.edu.ph</strong> or visit our office at Dr. Yanga’s Colleges Inc.
                </p>
            </div>
        </div>
    );
}

export default TermsOfServices;
