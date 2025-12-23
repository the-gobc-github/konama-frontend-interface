import { authFetch } from './authFetch';
import {
    ComfyInstanceResponse,
    SingleComfyInstanceResponse,
    ComfyWorkflowsResponse,
    SpawnInstanceResponse,
    UpdateInstanceParams,
} from '@/types/comfy';
import { config } from './config';

const BASE_URL = config.authApiUrl; // Default to https://client.konama.fuzdi.fr

export const ComfyAPI = {
    // Spawn a new instance
    async spawnInstance(): Promise<SpawnInstanceResponse> {
        const url = config.isDev
            ? `${BASE_URL}/comfy/instances?fake=true`
            : `${BASE_URL}/comfy/instances`;
        const response = await authFetch.post(url);
        return response.data;
    },

    // List all instances
    async listInstances(): Promise<ComfyInstanceResponse> {
        const response = await authFetch.get(`${BASE_URL}/comfy/instances`);
        return response.data;
    },

    // Get workflows for a specific instance
    async getWorkflows(instanceId: string): Promise<ComfyWorkflowsResponse> {
        const response = await authFetch.get(`${BASE_URL}/comfy/instances/${instanceId}/workflows`);
        return response.data;
    },

    // Update instance parameters
    async updateInstance(
        instanceId: string,
        params: UpdateInstanceParams
    ): Promise<SingleComfyInstanceResponse> {
        const response = await authFetch.patch(`${BASE_URL}/comfy/instances/${instanceId}`, params);
        return response.data;
    },

    // Scan workflows
    async scanWorkflows(
        instanceId: string,
        workflowName: string,
        overwrite: boolean = true
    ): Promise<void> {
        await authFetch.post(
            `${BASE_URL}/comfy/instances/${instanceId}/workflows/scan?stream=true`,
            {
                name: workflowName,
                overwrite,
            }
        );
    },
};
