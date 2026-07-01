// ragApi.ts
// API service layer for the LogiSense RAG application.
// Replace the dummy implementations with real axios calls to your LlamaIndex backend.

import axios from 'axios';
import type { AxiosInstance } from 'axios';

type ResponseMode = 'compact' | 'tree_summarize' | 'refine' | 'simple_summarize' | 'accumulate' | 'compact_accumulate';

interface SourceNode {
  metadata: {
    chunk_id: string;
    chunk_index: number;
    chunk_size: number;
    chunk_total: number;
    file_name: string;
    page_number: number;
  };
  rank: number;
  response: string;
  score: number;
}

interface DummyResponse {
  answer: string;
  sources: SourceNode[];
}

interface DummyResponseMap {
  [key: string]: DummyResponse[];
}

interface LoadIndexResponse {
  status: string;
  message: string;
}

interface QueryResponse {
  response_text: string;
  source_nodes: SourceNode[];
  latencyMs: number;
}

// Base URL — change this to your backend
const BASE_URL = 'https://fluffy-space-sniffle-vw764jxggw7hwrq5-8001.app.github.dev';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Dummy response data ──────────────────────────────────────────────────────

/* const DUMMY_RESPONSES: DummyResponseMap = {
  compact: [
    {
      answer: 'Forklifts must be operated only by certified personnel. Key safety requirements include: pre-operation inspection (tyres, brakes, fluid levels, horn), maximum load limits posted on the nameplate, mandatory seatbelt use, and a maximum speed of 8 km/h in warehouse aisles.',
      sources: ['WH-Safety-Manual-v3.pdf', 'Forklift-SOPs.pdf'],
    },
    {
      answer: 'Hazardous materials are stored in designated zones with clear HMIS labelling, spill containment trays, and a minimum 3-metre separation from flammable materials. MSDS sheets must be accessible at each storage bay.',
      sources: ['HazMat-Storage-Guidelines.pdf'],
    },
    {
      answer: 'Defence vehicle maintenance follows a 3-tier schedule: Daily checks (fluid, tyres, battery), Weekly inspections (brakes, lights, undercarriage), and Monthly full-service by authorised technicians only.',
      sources: ['Defence-Vehicle-Maintenance-SOP.pdf', 'Fleet-Management-Policy.pdf'],
    },
  ],
  tree_summarize: [
    {
      answer: 'Based on a hierarchical synthesis of all relevant documents:\n\n**Level 1 — Regulatory Foundation**\nAll warehouse operations comply with ISO 45001 and local occupational health mandates.\n\n**Level 2 — Operational Standards**\nSafety protocols are codified in SOPs reviewed quarterly. Personal Protective Equipment is mandatory in all active zones.\n\n**Level 3 — Specific Procedures**\nEach procedure references the regulation it satisfies, creating a traceable compliance chain from daily action to statutory requirement.',
      sources: ['WH-Safety-Manual-v3.pdf', 'ISO45001-Implementation.pdf', 'Compliance-Matrix.pdf'],
    },
  ],
  refine: [
    {
      answer: 'Initial answer: Emergency evacuation routes are marked with green illuminated signage.\n\nRefined with additional context: All primary exits are marked at 1m intervals with photoluminescent tape rated for 8 hours. Secondary evacuation routes activate upon fire alarm trigger. Assembly points are designated at GPS coordinates logged in the site emergency response plan. Evacuation drills are conducted bi-annually with full documentation.',
      sources: ['Emergency-Response-Plan.pdf', 'Site-Safety-Layout.pdf'],
    },
  ],
  simple_summarize: [
    {
      answer: 'Warehouse load-bearing limits: Ground floor 3.5 tonnes/m², Mezzanine 1.2 tonnes/m². Racking systems rated to manufacturers specifications only. Quarterly structural audits required.',
      sources: ['Structural-Engineering-Report.pdf'],
    },
  ],
  accumulate: [
    {
      answer: 'From Document 1 (WH Safety Manual): PPE requirements include hard hats, high-vis vests, and steel-toe boots in all operational areas.\n\nFrom Document 2 (Defence Fleet Policy): Vehicle operators must hold a valid Class C licence plus a site-specific induction certificate.\n\nFrom Document 3 (Incident Report Log): 94% of incidents in the last 12 months occurred due to PPE non-compliance or unauthorised vehicle access.',
      sources: ['WH-Safety-Manual-v3.pdf', 'Defence-Fleet-Policy.pdf', 'Incident-Report-2024.pdf'],
    },
  ],
  compact_accumulate: [
    {
      answer: 'Key findings across all documents: (1) PPE compliance is mandatory at all times — hard hats, vests, boots. (2) Forklift zones require trained operators only, speed limit 8 km/h. (3) HazMat zones require double-locking and signage. (4) Defence vehicles restricted to certified drivers with active security clearance.',
      sources: ['WH-Safety-Manual-v3.pdf', 'HazMat-Storage-Guidelines.pdf', 'Defence-Fleet-Policy.pdf'],
    },
  ],
};

function getDummyResponse(responseMode: ResponseMode): DummyResponse {
  const pool = DUMMY_RESPONSES[responseMode] || DUMMY_RESPONSES.compact;
  return pool[Math.floor(Math.random() * pool.length)];
} */

// ─── API Methods ──────────────────────────────────────────────────────────────

/**
 * loadIndex — Called on app launch to retrieve and cache the vector index.
 * Replace with your real LlamaIndex endpoint.
 */
export async function loadIndex(): Promise<LoadIndexResponse> {
  
  const response = await axios.get(`${BASE_URL}/build_index`); 
  if(response.status === 200) {
    return { status: 'ok', message: 'Index loaded successfully' };
  } else {
    return {status: 'error', message: response.data.message || "Cannot Load index at the moment."}
  }
}

/**
 * queryRAG — Send a user query with a specified response mode.
 * Replace with your real LlamaIndex query endpoint.
 *
 * @param {string} query - The user's natural language query
 * @param {string} responseMode - LlamaIndex ResponseMode enum value
 * @returns {{ answer: string, sources: SourceNode[], latencyMs: number }}
 */
export async function queryRAG(_query: string, responseMode: ResponseMode = 'compact'): Promise<QueryResponse> {
  // REAL implementation:
  const response = await axios.post(`${BASE_URL}/get_response`, {query: _query, response_mode: responseMode}); 
  console.log(response.data);
  return response.data;
}

export default api;
