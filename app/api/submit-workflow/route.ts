import { NextRequest, NextResponse } from 'next/server';
import { PromptSubmissionPayload } from '@/types/workflow-api';
import { config } from '@/lib/config';

/**
 * POST /api/submit-workflow
 * 
 * Submits a ComfyUI workflow with injected prompts to the backend /prompt endpoint.
 * The workflow should already have prompts injected via workflowPromptInjector.
 * 
 * Request body format (matches backend /prompt endpoint exactly):
 * {
 *   "workflow_id": "basic-wf-test",
 *   "mode": "slow",
 *   "prompt": {
 *     "id": "...",
 *     "revision": 0,
 *     "nodes": [...],
 *     "links": [...],
 *     ...
 *   },
 *   "comfyClientId": "web-client-123456"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: PromptSubmissionPayload = await request.json();

    console.log('📤 Submitting workflow to backend:', {
      workflow_id: body.workflow_id,
      mode: body.mode,
      comfyClientId: body.comfyClientId,
      nodeCount: body.prompt?.nodes?.length || 0,
    });

    // Validate required fields
    if (!body.workflow_id || !body.prompt || !body.comfyClientId) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Missing required fields: workflow_id, prompt, or comfyClientId',
        },
        { status: 400 }
      );
    }

    // Validate workflow structure
    if (!body.prompt.nodes || !Array.isArray(body.prompt.nodes)) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid workflow structure: missing or invalid nodes array',
        },
        { status: 400 }
      );
    }

    // Get Authorization header from incoming request
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Missing or invalid authorization header',
        },
        { status: 401 }
      );
    }

    // Forward the request to the backend /prompt endpoint
    const backendUrl = `${config.authApiUrl}/prompt`;
    console.log(`🔗 Forwarding to: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('❌ Backend error:', response.status, responseData);
      return NextResponse.json(
        {
          error: 'Backend Error',
          message: responseData.message || 'Failed to submit workflow to backend',
          details: responseData,
        },
        { status: response.status }
      );
    }

    console.log('✅ Workflow submitted successfully:', responseData);

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('❌ Error in /api/submit-workflow:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
