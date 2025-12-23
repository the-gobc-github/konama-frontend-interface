'use client';

import { useState, useCallback } from 'react';
import { ComfyAPI } from '@/lib/comfyApi';
import { ComfyInstance, UpdateInstanceParams } from '@/types/comfy';
import { toast } from 'react-toastify';

export function useComfyInstances() {
    const [instances, setInstances] = useState<ComfyInstance[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpawning, setIsSpawning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInstances = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await ComfyAPI.listInstances();
            setInstances(response.data);
        } catch (err: any) {
            const msg = err.message || 'Failed to fetch instances';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const spawnInstance = useCallback(async () => {
        setIsSpawning(true);
        setError(null);
        try {
            const response = await ComfyAPI.spawnInstance();
            toast.success('Instance spawned successfully!');
            await fetchInstances(); // Refresh list
            return response.data;
        } catch (err: any) {
            const msg = err.message || 'Failed to spawn instance';
            setError(msg);
            toast.error(msg);
            return null;
        } finally {
            setIsSpawning(false);
        }
    }, [fetchInstances]);

    const updateInstance = useCallback(async (instanceId: string, params: UpdateInstanceParams) => {
        try {
            const response = await ComfyAPI.updateInstance(instanceId, params);
            setInstances(prev => prev.map(inst => inst.id === instanceId ? response.data : inst));
            toast.success('Instance updated');
            return response.data;
        } catch (err: any) {
            const msg = err.message || 'Failed to update instance';
            toast.error(msg);
            return null;
        }
    }, []);

    const scanWorkflows = useCallback(async (instanceId: string, workflowName: string) => {
        try {
            toast.info('Workflow scan started...');
            await ComfyAPI.scanWorkflows(instanceId, workflowName);
            toast.success('Workflow scan completed');
        } catch (err: any) {
            const msg = err.message || 'Failed to scan workflow';
            toast.error(msg);
        }
    }, []);

    const getWorkflows = useCallback(async (instanceId: string) => {
        try {
            const response = await ComfyAPI.getWorkflows(instanceId);
            return response.data.workflows;
        } catch (err: any) {
            const msg = err.message || 'Failed to fetch workflows';
            toast.error(msg);
            return [];
        }
    }, []);

    return {
        instances,
        isLoading,
        isSpawning,
        error,
        fetchInstances,
        spawnInstance,
        updateInstance,
        scanWorkflows,
        getWorkflows
    };
}

