import React, { useState } from 'react';
import { CiUser } from "react-icons/ci";

const Login = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [isCodeCorrect, setIsCodeCorrect] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Portni 5000 ga o'zgartirdik
    const API_URL = "http://localhost:5000";

    const formatPhoneNumber = (value) => {
        const numbers = value.replace(/\D/g, '');
        
        if (numbers.length > 9) {
            return numbers.slice(0, 9);
        }
        
        let formatted = '';
        
        if (numbers.length > 0) {
            formatted += numbers.slice(0, 2);
        }
        if (numbers.length > 2) {
            formatted += ' ' + numbers.slice(2, 5);
        }
        if (numbers.length > 5) {
            formatted += ' ' + numbers.slice(5, 7);
        }
        if (numbers.length > 7) {
            formatted += ' ' + numbers.slice(7, 9);
        }
        
        return formatted;
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        const formatted = formatPhoneNumber(value);
        setPhoneNumber(formatted);
        setErrorMessage('');
    };

    const getCleanPhoneNumber = () => {
        return phoneNumber.replace(/\D/g, '');
    };

    const isValidPhoneNumber = () => {
        const cleanPhone = getCleanPhoneNumber();
        return cleanPhone.length === 9;
    };

    const sendCodeToServer = async () => {
        try {
            const cleanPhone = getCleanPhoneNumber();
            const fullPhone = '+998' + cleanPhone;
            
            console.log('📤 Serverga so\'rov yuborilmoqda:', fullPhone);

            const response = await fetch(`${API_URL}/sendPhone`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone: fullPhone })
            });
            
            if (!response.ok) {
                throw new Error(`Server xatosi: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📥 Server javobi:', data);
            
            return data.success;
        } catch (error) {
            console.error('❌ Serverga ulanishda xato:', error);
            setErrorMessage('Serverga ulanishda xato. Iltimos, backend serverni tekshiring.');
            return false;
        }
    };

    const verifyCodeWithServer = async () => {
        try {
            const cleanPhone = getCleanPhoneNumber();
            const fullPhone = '+998' + cleanPhone;
            
            console.log('🔐 Kod tekshirilmoqda:', { phone: fullPhone, code: verificationCode });

            const response = await fetch(`${API_URL}/verifyCode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    phone: fullPhone, 
                    code: verificationCode 
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server xatosi: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📥 Kod tekshirish javobi:', data);
            
            return data;
        } catch (error) {
            console.error('❌ Serverga ulanishda xato:', error);
            setErrorMessage('Serverga ulanishda xato. Iltimos, backend serverni tekshiring.');
            return { success: false, valid: false };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        
        if (!showCodeInput) {
            // Telefon raqamni tekshirish
            if (!isValidPhoneNumber()) {
                setErrorMessage('Iltimos, to\'liq telefon raqamingizni kiriting (9 raqam)');
                setIsLoading(false);
                return;
            }

            const sent = await sendCodeToServer();
            
            if (sent) {
                setShowCodeInput(true);
                setIsCodeCorrect(null);
                setVerificationCode('');
            } else {
                setErrorMessage('Kod yuborishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
            }
        } else {
            // Kodni tekshirish
            if (verificationCode.length !== 4) {
                setErrorMessage('Iltimos, 4 xonali kodni kiriting');
                setIsLoading(false);
                return;
            }

            const result = await verifyCodeWithServer();
            
            if (result.success && result.valid) {
                setIsCodeCorrect(true);
                setTimeout(() => {
                    handleCloseModal();
                    // Muvaffaqiyatli kirishdan keyin qo'shimcha amallar
                    alert('Muvaffaqiyatli kirildi!');
                }, 2000);
            } else {
                setIsCodeCorrect(false);
                setErrorMessage('Noto\'g\'ri kod. Iltimos, qaytadan urinib ko\'ring.');
            }
        }
        
        setIsLoading(false);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setShowCodeInput(false);
        setVerificationCode('');
        setIsCodeCorrect(null);
        setPhoneNumber('');
        setIsLoading(false);
        setErrorMessage('');
    };

    const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
        setVerificationCode(value);
        setErrorMessage('');
    };

    return (
        <div>
            <button 
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-gray-700 font-medium"
                onClick={() => setIsModalOpen(true)}
            >
                <CiUser className="w-5 h-5" />
                <span>войти</span>
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-xs relative shadow-lg">
                        {/* Uzum ID sarlavha */}
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">uzumID</h3>
                        </div>

                        {/* Asosiy sarlavha */}
                        <h2 className="text-lg font-semibold text-center text-gray-900 mb-6">
                            Войти в Uzum Market
                        </h2>
                        
                        {/* Telefon raqami kiritish qismi */}
                        <div className="mb-6">
                            <div className="flex items-center justify-center border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50">
                                <span className="text-gray-600 font-medium mr-2">+998</span>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={handlePhoneChange}
                                    className="flex-1 text-center text-base font-medium bg-transparent focus:outline-none"
                                    placeholder="99 999 99 99"
                                    maxLength="12"
                                    disabled={isLoading || showCodeInput}
                                />
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {showCodeInput && (
                                <div className="space-y-3">
                                    <div className="text-center">
                                        <span className="text-gray-600 text-sm">Пароль</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={handleCodeChange}
                                            placeholder="0000"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-base font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            maxLength="4"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    
                                    {isCodeCorrect !== null && (
                                        <div className={`text-center text-xs font-medium ${
                                            isCodeCorrect ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {isCodeCorrect ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Qabul qilindi
                                                </div>
                                            ) : (
                                                "Noto'g'ri parol"
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Xabar qismi */}
                            {errorMessage && (
                                <div className="text-center text-red-600 text-xs font-medium">
                                    {errorMessage}
                                </div>
                            )}
                            
                            <button 
                                type="submit" 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={isLoading || isCodeCorrect || (!showCodeInput && !isValidPhoneNumber()) || (showCodeInput && verificationCode.length !== 4)}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Yuklanmoqda...
                                    </div>
                                ) : (
                                    !showCodeInput ? "Получить код" : "Tasdiqlash"
                                )}
                            </button>
                        </form>

                        <p className="text-[10px] text-gray-500 text-center mt-4 leading-tight">
                            Продолжая, я соглашаюсь с политикой обработки персональных данных и офертой Uzum ID
                        </p>
                        
                        <a href="#" className="block text-center text-blue-600 hover:text-blue-700 text-xs mt-2 transition-colors duration-200">
                            Что такое Uzum ID?
                        </a>

                        <button 
                            className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            onClick={handleCloseModal}
                            disabled={isLoading}
                        >
                            <span className="text-lg">×</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;