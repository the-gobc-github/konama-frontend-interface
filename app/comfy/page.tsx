'use client';

import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useComfyInstances } from '@/hooks/useComfyInstances';
import { FormField } from '@/components/FormField';
import { GPUS } from '@/types/comfy';
import { toast } from 'react-toastify';

export default function ComfyManagementPage() {
    const { 
        instances, 
        isLoading, 
        isSpawning, 
        fetchInstances, 
        spawnInstance, 
        updateInstance, 
        scanWorkflows,
        getWorkflows 
    } = useComfyInstances();

    const [selectedGpu, setSelectedGpu] = useState<string>('');
    const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
    const [selectedMode, setSelectedMode] = useState<'run' | 'creation'>('run');
    const [workflowsMap, setWorkflowsMap] = useState<Record<string, string[]>>({});
    const [loadingWorkflows, setLoadingWorkflows] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchInstances();
    }, [fetchInstances]);

    const handleSpawn = async () => {
        const result = await spawnInstance();
        if (result && result.url) {
            window.open(result.url, '_blank');
        }
    };

    const loadWorkflowsForInstance = async (instanceId: string) => {
        if (loadingWorkflows[instanceId]) return;
        
        setLoadingWorkflows(prev => ({ ...prev, [instanceId]: true }));
        try {
            const workflows = await getWorkflows(instanceId);
            setWorkflowsMap(prev => ({ ...prev, [instanceId]: workflows }));
        } finally {
            setLoadingWorkflows(prev => ({ ...prev, [instanceId]: false }));
        }
    };

    const handleUpdate = async (instanceId: string) => {
        await updateInstance(instanceId, {
            gpuType: selectedGpu,
            workflowName: selectedWorkflow,
            mode: selectedMode
        });
    };

    const handleScan = async (instanceId: string, workflowName: string) => {
        if (!workflowName) {
            toast.error('Please select a workflow to scan');
            return;
        }
        await scanWorkflows(instanceId, workflowName);
    };

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8 text-white">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                                ComfyUI Instances
                            </h1>
                            <p className="text-gray-400 mt-2">Manage and spawn your ComfyUI environments</p>
                        </div>
                        <button
                            onClick={handleSpawn}
                            disabled={isSpawning}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSpawning ? (
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            )}
                            Spawn New Instance
                        </button>
                    </div>

                    {isLoading && instances.length === 0 ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {instances.map((instance) => (
                                <div key={instance.id} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                                                {instance.stackName || 'Unnamed Instance'}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-mono mt-1">{instance.id}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            instance.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                            {instance.status}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-3 bg-gray-900/50 rounded-xl border border-gray-700/50">
                                            <p className="text-xs text-gray-500 mb-1">Instance URL</p>
                                            <a 
                                                href={instance.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-sm text-purple-400 hover:underline break-all"
                                            >
                                                {instance.url}
                                            </a>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                id={`gpu-${instance.id}`}
                                                label="GPU Type"
                                                type="select"
                                                value={selectedGpu || instance.gpuType || ''}
                                                onChange={(val) => setSelectedGpu(val as string)}
                                                options={GPUS.map(gpu => ({ value: gpu, label: gpu }))}
                                            />
                                            <FormField
                                                id={`mode-${instance.id}`}
                                                label="Mode"
                                                type="select"
                                                value={selectedMode || instance.mode || 'run'}
                                                onChange={(val) => setSelectedMode(val as 'run' | 'creation')}
                                                options={[
                                                    { value: 'run', label: 'Run' },
                                                    { value: 'creation', label: 'Creation' }
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-end mb-1">
                                                <label className="block text-xs font-medium text-gray-300">Workflow</label>
                                                <button 
                                                    onClick={() => loadWorkflowsForInstance(instance.id)}
                                                    className="text-[10px] text-purple-400 hover:text-purple-300 uppercase tracking-wider font-bold"
                                                >
                                                    {loadingWorkflows[instance.id] ? 'Loading...' : 'Refresh List'}
                                                </button>
                                            </div>
                                            <select
                                                value={selectedWorkflow || instance.workflowName || ''}
                                                onChange={(e) => setSelectedWorkflow(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-colors"
                                            >
                                                <option value="">Select a workflow</option>
                                                {(workflowsMap[instance.id] || (instance.workflowName ? [instance.workflowName] : [])).map(wf => (
                                                    <option key={wf} value={wf}>{wf}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => handleUpdate(instance.id)}
                                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Update Params
                                            </button>
                                            <button
                                                onClick={() => handleScan(instance.id, selectedWorkflow || instance.workflowName || '')}
                                                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Scan Workflow
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && instances.length === 0 && (
                        <div className="text-center py-20 bg-gray-800/20 rounded-3xl border border-dashed border-gray-700">
                            <p className="text-gray-500">No instances found. Spawn one to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}



