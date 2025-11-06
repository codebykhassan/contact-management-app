'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Contact {
    id: number;
    name: string;
    email: string;
    phone: string;
    photo: string | null;
    createdAt: string;
}

export default function DashboardPage() {
    const { user, logout, loading: authLoading } = useAuth();
    const router = useRouter();

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/contacts', {
                params: { page, limit: 10, search: search || undefined, sortBy, sortOrder },
            });
            setContacts(response.data.data);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            alert('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchContacts();
    }, [user, page, search, sortBy, sortOrder]);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;
        try {
            await api.delete(`/contacts/${id}`);
            alert('Contact deleted successfully');
            fetchContacts();
        } catch (error) {
            console.error('Error deleting contact:', error);
            alert('Failed to delete contact');
        }
    };

    const handleEdit = (contact: Contact) => {
        setSelectedContact(contact);
        setShowEditModal(true);
    };

    if (authLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
                <p className="text-lg text-gray-700">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-md border-b border-blue-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <h1 className="text-2xl font-extrabold text-blue-700 text-center sm:text-left">
                        Contact Dashboard
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-center sm:text-left">
                        <span className="text-sm text-gray-600 break-all">{user.email}</span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition shadow-sm hover:shadow-md"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Controls */}
                <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-lg border border-blue-100 mb-8">
                    <div className="flex flex-col md:flex-row flex-wrap gap-4 md:items-center md:justify-between">
                        <div className="w-full md:flex-1">
                            <input
                                type="text"
                                placeholder="🔍 Search by name or email..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-between sm:justify-start">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="createdAt">Sort by Date</option>
                                <option value="name">Sort by Name</option>
                                <option value="email">Sort by Email</option>
                            </select>

                            <button
                                onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                            >
                                {sortOrder === 'ASC' ? '↑' : '↓'}
                            </button>

                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow-md"
                            >
                                + Add Contact
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contact Cards */}
                {loading ? (
                    <div className="text-center py-12 text-gray-600">Loading contacts...</div>
                ) : contacts.length === 0 ? (
                    <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow text-center border border-blue-100">
                        <p className="text-gray-600">No contacts found. Add your first contact!</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {contacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow hover:shadow-lg border border-blue-100 transition"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-full bg-blue-100 flex-shrink-0 overflow-hidden">
                                            {contact.photo ? (
                                                <img
                                                    src={`http://localhost:4000${contact.photo}`}
                                                    alt={contact.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-blue-600">
                                                    {contact.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-blue-800 truncate">
                                                {contact.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 truncate">{contact.email}</p>
                                            <p className="text-sm text-gray-600">{contact.phone}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Added: {new Date(contact.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                        <button
                                            onClick={() => handleEdit(contact)}
                                            className="flex-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(contact.id)}
                                            className="flex-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-wrap justify-center items-center gap-3 mt-8">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="px-4 py-2 text-black bg-white/80 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-gray-700 text-sm sm:text-base">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                                className="px-4 py-2 text-black bg-white/80 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </main>

            {showAddModal && (
                <AddContactModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchContacts();
                    }}
                />
            )}
            {showEditModal && selectedContact && (
                <EditContactModal
                    contact={selectedContact}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedContact(null);
                    }}
                    onSuccess={() => {
                        setShowEditModal(false);
                        setSelectedContact(null);
                        fetchContacts();
                    }}
                />
            )}
        </div>
    );
}

/* === MODALS === */
function ModalWrapper({ title, children, onClose }: any) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-2">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 w-full max-w-md shadow-lg border border-blue-100 mx-2 sm:mx-0">
                <h2 className="text-xl font-bold text-blue-700 mb-4 text-center">{title}</h2>
                {children}
            </div>
        </div>
    );
}

function Input({ label, value, setValue, type = 'text' }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}

function FileInput({ label, setFile }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}

function ModalButtons({ onClose, loading, label }: any) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-red-50 active:bg-red-100"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
                {loading ? 'Saving...' : label}
            </button>
        </div>
    );
}

/* === AddContactModal === */
function AddContactModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('phone', phone);
            if (photo) formData.append('photo', photo);
            await api.post('/contacts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Contact added successfully!');
            onSuccess();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to add contact');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper title="Add New Contact" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Name" value={name} setValue={setName} />
                <Input label="Email" value={email} setValue={setEmail} type="email" />
                <Input label="Phone" value={phone} setValue={setPhone} type="tel" />
                <FileInput label="Photo (optional)" setFile={setPhoto} />
                <ModalButtons onClose={onClose} loading={loading} label="Add Contact" />
            </form>
        </ModalWrapper>
    );
}

/* === EditContactModal === */
function EditContactModal({
    contact,
    onClose,
    onSuccess,
}: {
    contact: Contact;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [name, setName] = useState(contact.name);
    const [email, setEmail] = useState(contact.email);
    const [phone, setPhone] = useState(contact.phone);
    const [photo, setPhoto] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('phone', phone);
            if (photo) formData.append('photo', photo);
            await api.put(`/contacts/${contact.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Contact updated successfully!');
            onSuccess();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update contact');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper title="Edit Contact" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Name" value={name} setValue={setName} />
                <Input label="Email" value={email} setValue={setEmail} type="email" />
                <Input label="Phone" value={phone} setValue={setPhone} type="tel" />
                <FileInput label="Change Photo (optional)" setFile={setPhoto} />
                <ModalButtons onClose={onClose} loading={loading} label="Update Contact" />
            </form>
        </ModalWrapper>
    );
}
