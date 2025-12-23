// Types for ComfyUI instance management

export interface ComfyInstance {
    id: string;
    userId: string;
    instanceId: string;
    url: string;
    stackName: string;
    createdAt: string;
    lastDateUtilisation: string | null;
    gpuType: string | null;
    workflowName: string | null;
    mode: 'run' | 'creation' | null;
    status: 'active' | 'inactive' | 'pending';
}

export interface ComfyInstanceResponse {
    data: ComfyInstance[];
}

export interface SingleComfyInstanceResponse {
    data: ComfyInstance;
}

export interface ComfyWorkflowsResponse {
    data: {
        path: string;
        count: number;
        workflows: string[];
    };
}

export interface SpawnInstanceResponse {
    data: {
        instanceId: string;
        url: string;
        stackName: string;
    };
}

export interface UpdateInstanceParams {
    gpuType?: string;
    workflowName?: string;
    mode?: 'run' | 'creation';
}

export const GPUS = [
    "RTX 4090",
    "RTX 4080",
    "RTX 3090",
    "RTX 3090 Ti",
    "RTX 3080",
    "RTX 3080 Ti",
    "RTX 3070 Ti",
    "RTX 3060",
    "RTX 3060 Ti",
    "RTX A6000",
    "RTX A5000",
    "RTX A4000",
    "A40",
    "A100",
    "V100",
    "L40",
    "L40S",
    "H100",
    "H200",
    "GH200"
];

