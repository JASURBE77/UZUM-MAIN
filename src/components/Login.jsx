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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    {/* Orqa fon - blur effekt */}
                    <div className="absolute inset-0 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    
                    {/* Asosiy modal */}
                    <div className="bg-white rounded-3xl w-full max-w-sm relative shadow-2xl border border-gray-200">
                        {/* Yopish tugmasi */}
                        <button 
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors duration-200 z-10 bg-white rounded-full shadow-sm"
                            onClick={handleCloseModal}
                            disabled={isLoading}
                        >
                            <span className="text-xl">×</span>
                        </button>

                        {/* Modal kontenti */}
                        <div className="p-8">
                            {/* Uzum ID sarlavha */}
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">uzumID</h3>
                            </div>

                            {/* Asosiy sarlavha */}
                            <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
                                Войти в Uzum Market
                            </h2>
                            
                            <p className="text-sm text-gray-600 text-center mb-6">
                                Введите номер телефона
                            </p>
                            
                            {/* Telefon raqami kiritish qismi */}
                            <div className="mb-6">
                                <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 bg-white hover:border-purple-400 transition-colors duration-200">
                                    <span className="text-gray-600 font-medium text-lg mr-3">+998</span>
                                    <input
                                        type="text"
                                        value={phoneNumber}
                                        onChange={handlePhoneChange}
                                        className="flex-1 text-lg font-medium bg-transparent focus:outline-none placeholder-gray-400"
                                        placeholder="00 000 00 00"
                                        maxLength="12"
                                        disabled={isLoading || showCodeInput}
                                    />
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {showCodeInput && (
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <span className="text-gray-600 text-sm">Пароль</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={verificationCode}
                                                onChange={handleCodeChange}
                                                placeholder="0000"
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-lg font-semibold focus:outline-none focus:border-purple-400 transition-colors duration-200"
                                                maxLength="4"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                        
                                        {isCodeCorrect !== null && (
                                            <div className={`text-center text-sm font-medium ${
                                                isCodeCorrect ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {isCodeCorrect ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
                                    <div className="text-center text-red-600 text-sm font-medium bg-red-50 py-2 rounded-lg">
                                        {errorMessage}
                                    </div>
                                )}
                                
                                <button 
                                    type="submit" 
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-semibold text-base transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-200"
                                    disabled={isLoading || isCodeCorrect || (!showCodeInput && !isValidPhoneNumber()) || (showCodeInput && verificationCode.length !== 4)}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Yuklanmoqda...
                                        </div>
                                    ) : (
                                        !showCodeInput ? "Получить код" : "Tasdiqlash"
                                    )}
                                </button>
                            </form>

                            <p className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
                                Продолжая, я соглашаюсь с политикой обработки персональных данных и офертой Uzum ID
                            </p>
                            
                            <a href="#" className="block text-center text-purple-600 hover:text-purple-700 text-sm mt-4 transition-colors duration-200 font-medium">
                                Что такое Uzum ID?
                            </a>
                        </div>

                        {/* Pastki dekorativ qism */}
                        <div className="border-t border-gray-100 py-4 px-8 bg-gray-50 rounded-b-3xl">
                            <div className="flex justify-center space-x-6">
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                        </svg>
                                    </div>
                                    <span className="text-xs text-gray-600">Безопасно</span>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                        </svg>
                                    </div>
                                    <span className="text-xs text-gray-600">Надежно</span>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                        <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                                        </svg>
                                    </div>
                                    <span className="text-xs text-gray-600">Защищено</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;