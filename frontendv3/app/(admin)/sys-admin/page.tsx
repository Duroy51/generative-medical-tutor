"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import {
    Users, ShieldCheck, Database, TrendingUp,
    ArrowUpRight, ArrowRight, UserPlus, FileCheck,
    Clock, Activity
} from 'lucide-react';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Simulation d'activités récentes (En attendant une vraie table de logs)
    // Dans une V2, on pourra créer un endpoint /api/admin/logs/
    const recentActivities = [
        { id: 1, type: 'registration', text: "Nouveau compte étudiant créé", time: "Il y a 2 min", user: "thomas.k" },
        { id: 2, type: 'validation', text: "Cas #140 validé par Expert", time: "Il y a 15 min", user: "Dr. House" },
        { id: 3, type: 'simulation', text: "Simulation terminée (Score: 85%)", time: "Il y a 1h", user: "sarah.m" },
        { id: 4, type: 'rejection', text: "Cas #142 rejeté (Incohérence)", time: "Il y a 2h", user: "Dr. House" },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/users/stats/');
                setStats(res.data);
            } catch (error) {
                console.error("Erreur stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Vue d'ensemble</h1>
                    <p className="text-gray-500 mt-1">Bienvenue sur le panneau de contrôle maître.</p>
                </div>
                <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                    Dernière màj : {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* --- KPI CARDS (PREMIUM STYLE) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Utilisateurs"
                    value={stats?.users?.total || 0}
                    icon={Users}
                    trend="+12%"
                    color="text-indigo-600"
                    bg="bg-indigo-100"
                />
                <StatCard
                    title="Experts Actifs"
                    value={stats?.users?.experts || 0}
                    icon={ShieldCheck}
                    trend="+2"
                    color="text-purple-600"
                    bg="bg-purple-100"
                />
                <StatCard
                    title="Cas Cliniques"
                    value={stats?.content?.cases || 0}
                    icon={Database}
                    trend="+5 cette semaine"
                    color="text-blue-600"
                    bg="bg-blue-100"
                />
                <StatCard
                    title="Simulations"
                    value={stats?.activity?.sessions || 0}
                    icon={Activity}
                    trend="+18%"
                    color="text-emerald-600"
                    bg="bg-emerald-100"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* --- COLONNE GAUCHE (2/3) : ACTIVITÉS --- */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Clock size={18} className="text-gray-400"/> Activité de la plateforme
                        </h3>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                            Voir tout
                        </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentActivities.map((act) => (
                            <div key={act.id} className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                                <div className={`p-2 rounded-full flex-shrink-0 ${
                                    act.type === 'registration' ? 'bg-blue-50 text-blue-600' :
                                        act.type === 'validation' ? 'bg-green-50 text-green-600' :
                                            act.type === 'rejection' ? 'bg-red-50 text-red-600' :
                                                'bg-gray-100 text-gray-600'
                                }`}>
                                    {act.type === 'registration' && <UserPlus size={16} />}
                                    {act.type === 'validation' && <FileCheck size={16} />}
                                    {act.type === 'simulation' && <TrendingUp size={16} />}
                                    {act.type === 'rejection' && <Activity size={16} />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{act.text}</p>
                                    <p className="text-xs text-gray-400">par <span className="font-mono text-gray-500">{act.user}</span></p>
                                </div>
                                <span className="text-xs font-medium text-gray-400 whitespace-nowrap">{act.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- COLONNE DROITE (1/3) : ACTIONS RAPIDES --- */}
                <div className="space-y-6">

                    {/* Quick Actions */}
                    <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <h3 className="font-bold text-lg mb-1 relative z-10">Actions Rapides</h3>
                        <p className="text-indigo-200 text-sm mb-6 relative z-10">Gestion courante</p>

                        <div className="space-y-3 relative z-10">
                            <Link href="/sys-admin/users" className="block w-full">
                                <div className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm p-3 rounded-xl flex items-center justify-between transition-all group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-1.5 rounded-lg text-indigo-900"><UserPlus size={16}/></div>
                                        <span className="text-sm font-bold">Gérer les utilisateurs</span>
                                    </div>
                                    <ArrowRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>

                            {/* On pourrait ajouter d'autres liens ici (ex: Config Système) */}
                            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/5 p-3 rounded-xl flex items-center justify-between transition-all group text-indigo-200 hover:text-white">
                                <span className="text-sm font-medium ml-1">Paramètres Système</span>
                                <ArrowRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>

                    {/* Mini Stat Répartition */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Répartition</h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Étudiants</span>
                            <span className="text-sm font-bold text-gray-900">{stats?.users?.students}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                            <div className="bg-orange-400 h-2 rounded-full" style={{ width: '80%' }}></div>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Experts</span>
                            <span className="text-sm font-bold text-gray-900">{stats?.users?.experts}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

// --- SOUS-COMPOSANT : CARTE KPI ---
function StatCard({ title, value, icon: Icon, trend, color, bg }: any) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${bg} ${color}`}>
                    <Icon size={22} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <ArrowUpRight size={12} /> {trend}
                    </div>
                )}
            </div>
            <div>
                <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h4>
                <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
            </div>
        </div>
    );
}