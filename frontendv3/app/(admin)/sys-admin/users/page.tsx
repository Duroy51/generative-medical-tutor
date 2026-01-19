"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Plus, Search, User, Shield, GraduationCap,
    Edit2, Activity, Ban, Key, CheckCircle, Lock
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function UsersManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modale Création Expert
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newExpert, setNewExpert] = useState({ username: '', email: '', password: '', firstName: '', lastName: '' });

    // Modale Édition (Role & Password)
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({ role: '', newPassword: '' });

    // --- CHARGEMENT ---
    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users/');
            setUsers(res.data);
        } catch (e) { toast.error("Erreur chargement utilisateurs"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    // --- ACTIONS ---

    // 1. CRÉER EXPERT
    const handleCreateExpert = async () => {
        try {
            await api.post('/admin/users/create_expert/', {
                username: newExpert.username, password: newExpert.password, email: newExpert.email,
                first_name: newExpert.firstName, last_name: newExpert.lastName
            });
            toast.success("Compte Expert créé !");
            setIsCreateModalOpen(false);
            fetchUsers();
            setNewExpert({ username: '', email: '', password: '', firstName: '', lastName: '' });
        } catch (e) { toast.error("Erreur création."); }
    };

    // 2. TOGGLE STATUS (BAN/UNBAN)
    const handleToggleStatus = async (user: any) => {
        const action = user.is_active ? "désactiver" : "réactiver";
        if (!confirm(`Voulez-vous vraiment ${action} cet utilisateur ?`)) return;

        try {
            await api.post(`/admin/users/${user.id}/toggle_status/`);
            toast.success(`Utilisateur ${user.is_active ? 'désactivé' : 'activé'}`);
            // Mise à jour locale optimiste
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
        } catch (e) { toast.error("Erreur action."); }
    };

    // 3. MISE À JOUR RÔLE ET MOT DE PASSE
    const handleUpdateUser = async () => {
        if (!editingUser) return;

        try {
            // A. Mise à jour du rôle
            if (editForm.role !== editingUser.role) {
                await api.patch(`/admin/users/${editingUser.id}/`, { profile: { role: editForm.role } });
                toast.success("Rôle mis à jour");
            }

            // B. Reset Password (si rempli)
            if (editForm.newPassword) {
                await api.post(`/admin/users/${editingUser.id}/reset_password/`, { password: editForm.newPassword });
                toast.success("Mot de passe réinitialisé");
            }

            setIsModalOpen_Edit(false);
            fetchUsers(); // On recharge pour être sûr
        } catch (e) { toast.error("Erreur lors de la mise à jour"); }
    };

    // Helpers Modale Édition
    const [isModalOpen_Edit, setIsModalOpen_Edit] = useState(false);
    const openEditModal = (u: any) => {
        setEditingUser(u);
        setEditForm({ role: u.role, newPassword: '' });
        setIsModalOpen_Edit(true);
    };

    // --- FILTRAGE ---
    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
                    <p className="text-gray-500 text-sm">Administrez les accès et les rôles.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-200"
                >
                    <Plus size={18} /> Nouvel Expert
                </button>
            </div>

            {/* Barre de recherche */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text" placeholder="Rechercher par nom ou email..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={search} onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Tableau Complet */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold">
                        <th className="px-6 py-4">Utilisateur</th>
                        <th className="px-6 py-4">Rôle</th>
                        <th className="px-6 py-4">Statut</th>
                        <th className="px-6 py-4">Date d'arrivée</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((u) => (
                        <tr key={u.id} className={`transition-colors ${!u.is_active ? 'bg-red-50/50' : 'hover:bg-gray-50/50'}`}>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${u.is_active ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-500'}`}>
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className={`font-bold text-sm ${u.is_active ? 'text-gray-900' : 'text-red-800'}`}>{u.username}</p>
                                        <p className="text-xs text-gray-500">{u.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {u.role === 'ADMIN' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700"><Shield size={12}/> Admin</span>}
                                {u.role === 'EXPERT' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><Activity size={12}/> Expert</span>}
                                {u.role === 'APPRENANT' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700"><GraduationCap size={12}/> Étudiant</span>}
                            </td>
                            <td className="px-6 py-4">
                                {u.is_active ? (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-green-700 bg-green-50 border border-green-100">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> Actif
                                </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-red-700 bg-red-50 border border-red-100">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> Inactif
                                </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(u.date_joined).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => openEditModal(u)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Éditer le rôle ou le mot de passe"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(u)}
                                        className={`p-2 rounded-lg transition-colors ${u.is_active ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                        title={u.is_active ? "Désactiver le compte" : "Réactiver le compte"}
                                    >
                                        {u.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODALE 1 : CRÉATION EXPERT --- */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Ajouter un Expert">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Prénom" value={newExpert.firstName} onChange={(e) => setNewExpert({...newExpert, firstName: e.target.value})} />
                        <Input label="Nom" value={newExpert.lastName} onChange={(e) => setNewExpert({...newExpert, lastName: e.target.value})} />
                    </div>
                    <Input label="Email" type="email" value={newExpert.email} onChange={(e) => setNewExpert({...newExpert, email: e.target.value})} />
                    <Input label="Nom d'utilisateur" value={newExpert.username} onChange={(e) => setNewExpert({...newExpert, username: e.target.value})} />
                    <Input label="Mot de passe provisoire" type="password" value={newExpert.password} onChange={(e) => setNewExpert({...newExpert, password: e.target.value})} />

                    <div className="pt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
                        <Button onClick={handleCreateExpert} className="bg-indigo-600 hover:bg-indigo-700">Créer le compte</Button>
                    </div>
                </div>
            </Modal>

            {/* --- MODALE 2 : ÉDITION UTILISATEUR --- */}
            <Modal isOpen={isModalOpen_Edit} onClose={() => setIsModalOpen_Edit(false)} title={`Éditer ${editingUser?.username}`}>
                <div className="space-y-6">

                    {/* Gestion du Rôle */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Rôle Système</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                            value={editForm.role}
                            onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                        >
                            <option value="APPRENANT">Étudiant (Apprenant)</option>
                            <option value="EXPERT">Médecin (Expert)</option>
                            <option value="ADMIN">Administrateur</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                            Attention : Donner le rôle ADMIN donne accès à cette page.
                        </p>
                    </div>

                    <div className="border-t border-gray-100"></div>

                    {/* Reset Mot de Passe */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Key size={16} className="text-gray-400"/> Réinitialiser le mot de passe
                        </label>
                        <Input
                            type="password"
                            placeholder="Nouveau mot de passe (laisser vide si inchangé)"
                            value={editForm.newPassword}
                            onChange={(e) => setEditForm({...editForm, newPassword: e.target.value})}
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen_Edit(false)}>Annuler</Button>
                        <Button onClick={handleUpdateUser} className="bg-indigo-600 hover:bg-indigo-700">Enregistrer les modifications</Button>
                    </div>
                </div>
            </Modal>

        </div>
    );
}