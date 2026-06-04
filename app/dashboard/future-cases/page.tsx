'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '../../../_services/admin/adminService';
import { Calendar, ArrowLeft, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { caseWorkspaceService } from '@/_services/case/caseWorkspaceService';

interface FutureCase {
    id: number;
    caseNumber: string;
    caseTitle: string;
    filingDate: string;
    assignedLawyer: string;
    court: {
        courtName: string;
        location: string;
    };
    status: string;
}

export default function FutureCasesPage() {
    const router = useRouter();
    const [cases, setCases] = useState<FutureCase[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0); // 0-indexed for Spring Boot
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / pageSize);

    // Modal states
    const [selectedCase, setSelectedCase] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);

    useEffect(() => {
        const fetchFutureCases = async () => {
            setIsLoading(true);
            try {
                // Pass pagination parameters to the service
                const result = await adminService.getFutureCases(currentPage, pageSize); 
                if (result) {
                    setCases(result.data || []);
                    // CRITICAL FIX: Look for totalItems from the Spring Boot response
                    setTotalItems(result.totalItems ?? result.caseCount ?? 0);
                }
            } catch (err) {
                console.error("Failed to fetch future cases:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFutureCases();
    }, [currentPage, pageSize]); // Re-fetch when page or size changes

    const handleViewCase = async (caseId: number) => {
        setIsModalOpen(true);
        setIsModalLoading(true);
        try {
            const caseDetails = await caseWorkspaceService.getCaseById(caseId);
            setSelectedCase(caseDetails);
        } catch (error) {
            console.error("Error fetching case details:", error);
        } finally {
            setIsModalLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCase(null);
    };

    const handlePrevPage = () => {
        if (currentPage > 0) setCurrentPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(0); // Reset to first page when changing row count
    };

    return (
        <div className="space-y-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => router.back()} 
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">
                        Hearing Cases
                    </h1>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-purple-50">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <h2 className="text-lg font-bold text-slate-900">Upcoming Future Cases List</h2>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider border-b">
                                    <th className="p-4 font-semibold">Case Number</th>
                                    <th className="p-4 font-semibold">Title</th>
                                    <th className="p-4 font-semibold">Court</th>
                                    <th className="p-4 font-semibold">Filing Date</th>
                                    <th className="p-4 font-semibold">Assigned Lawyer</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cases.length > 0 ? (
                                    cases.map((c) => (
                                        <tr key={c.id} className="border-b hover:bg-slate-50 text-sm transition-colors">
                                            <td className="p-4 font-medium text-blue-600">{c.caseNumber}</td>
                                            <td className="p-4 text-slate-800">{c.caseTitle}</td>
                                            <td className="p-4 text-slate-600">{c.court?.courtName}</td>
                                            <td className="p-4 text-slate-600">{c.filingDate}</td>
                                            <td className="p-4 text-slate-600">{c.assignedLawyer}</td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                                    {c.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => handleViewCase(c.id)}
                                                    className="flex items-center justify-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors mx-auto"
                                                >
                                                    <Eye className="w-3 h-3" /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-500">
                                            No future cases found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                {!isLoading && cases.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600">Rows per page:</span>
                                <select
                                    value={pageSize}
                                    onChange={handlePageSizeChange}
                                    className="border border-slate-300 rounded-md bg-white text-sm text-slate-700 py-1 pl-2 pr-6 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer"
                                >
                                    <option value={2}>2</option>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                            <div className="text-sm text-slate-600 hidden sm:block">
                                Showing <span className="font-medium text-slate-900">{totalItems === 0 ? 0 : currentPage * pageSize + 1}</span> to <span className="font-medium text-slate-900">{Math.min((currentPage + 1) * pageSize, totalItems)}</span> of <span className="font-medium text-slate-900">{totalItems}</span> entries
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 0}
                                className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-medium text-slate-700 px-2">
                                Page {currentPage + 1} of {Math.max(1, totalPages)}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage >= totalPages - 1 || totalPages === 0}
                                className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Popup */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">Case Details</h3>
                            <button onClick={closeModal} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            {isModalLoading ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                </div>
                            ) : selectedCase ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <p className="text-xs text-slate-500 uppercase font-semibold">Case Number</p>
                                            <p className="font-medium text-slate-900">{selectedCase.caseNumber}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <p className="text-xs text-slate-500 uppercase font-semibold">Title</p>
                                            <p className="font-medium text-slate-900">{selectedCase.caseTitle}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <p className="text-xs text-slate-500 uppercase font-semibold">Assigned Lawyer</p>
                                            <p className="font-medium text-slate-900">{selectedCase.assignedLawyer}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <p className="text-xs text-slate-500 uppercase font-semibold">Status</p>
                                            <p className="font-medium text-slate-900">{selectedCase.status}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Description</p>
                                        <p className="text-sm text-slate-700 mt-1">{selectedCase.description || 'No description provided.'}</p>
                                    </div>

                                    {/* Hearings Section */}
                                    {selectedCase.hearings && selectedCase.hearings.length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="text-sm font-bold text-slate-900 border-b pb-2 mb-3">Scheduled Hearings</h4>
                                            <div className="space-y-2">
                                                {selectedCase.hearings.map((hearing: any) => (
                                                    <div key={hearing.id} className="flex justify-between items-center p-3 bg-purple-50 rounded border border-purple-100 text-sm">
                                                        <div>
                                                            <p className="font-semibold text-purple-900">{hearing.hearingDate}</p>
                                                            <p className="text-xs text-purple-700">{hearing.hearingType}</p>
                                                        </div>
                                                        <div className="text-right max-w-[50%]">
                                                            <p className="text-xs text-slate-600 truncate">{hearing.notes || 'No notes'}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-center text-red-500">Failed to load case data.</p>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
                            <button 
                                onClick={closeModal}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}