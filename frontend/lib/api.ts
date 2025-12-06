import apiClient from './ApiService';

// ============================================
// TYPES & INTERFACES (basés sur votre Django)
// ============================================

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Symptom {
  id?: number;
  nom: string;
  localisation?: string;
  date_debut?: string;
  frequence?: string;
  duree?: string;
  evolution?: string;
  activite_declenchante?: string;
  degre?: number;
}

export interface MedicalHistory {
  id?: number;
  type: 'medical' | 'chirurgical' | 'obstetrical' | 'familial' | 'allergie';
  description: string;
}

export interface CurrentTreatment {
  id?: number;
  nom: string;
  posologie?: string;
  date_debut?: string;
  efficacite?: string;
}

export interface ComplementaryExam {
  id?: number;
  nom: string;
  resultat: string;
}

export interface PhysicalFinding {
  id?: number;
  nom_examen: string;
  resultat_observation: string;
}

export interface Diagnosis {
  id?: number;
  description: string;
  is_final: boolean;
}

export interface ClinicalCase {
  id: number;
  source_fultang_id: string;
  status: 'non_approuve' | 'approuve' | 'rejete';
  validated_by?: number;
  created_at: string;
  updated_at: string;
  
  case_title: string;
  case_summary?: string;
  learning_objectives?: string;
  motif_consultation: string;
  age: number;
  sexe: string;
  
  etat_civil?: string;
  profession?: string;
  nombre_enfant?: number;
  groupe_sanguin?: string;
  
  mode_de_vie?: any;
  categories?: number[] | Category[];
  raw_llm_suggestions?: any;
  
  // Relations
  symptoms?: Symptom[];
  history_entries?: MedicalHistory[];
  current_treatments?: CurrentTreatment[];
  exams?: ComplementaryExam[];
  physical_findings?: PhysicalFinding[];
  diagnoses?: Diagnosis[];
}

export interface CreateCaseData {
  source_fultang_id: string;
  case_title: string;
  motif_consultation: string;
  age: number;
  sexe: string;
  
  case_summary?: string;
  learning_objectives?: string;
  etat_civil?: string;
  profession?: string;
  nombre_enfant?: number;
  groupe_sanguin?: string;
  mode_de_vie?: any;
  categories?: number[];
  
  // Relations (nested)
  symptoms?: Symptom[];
  history_entries?: MedicalHistory[];
  current_treatments?: CurrentTreatment[];
  exams?: ComplementaryExam[];
  physical_findings?: PhysicalFinding[];
  diagnoses?: Diagnosis[];
}

// ============================================
// CLINICAL CASES API
// ============================================

export async function getCases(): Promise<ClinicalCase[]> {
  try {
    const response = await apiClient.get('/cases/');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching cases:', error);
    throw error;
  }
}

export async function getCase(id: string): Promise<ClinicalCase> {
  try {
    const response = await apiClient.get(`/cases/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching case ${id}:`, error);
    throw error;
  }
}

export async function createCase(data: CreateCaseData): Promise<ClinicalCase> {
  try {
    console.log('📤 Creating case with data:', data);
    const response = await apiClient.post('/cases/', data);
    console.log('✅ Case created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating case:', error);
    
    if (error.response?.data) {
      const errorMessages = Object.entries(error.response.data)
        .map(([field, messages]: [string, any]) => 
          `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
        )
        .join(' | ');
      throw new Error(errorMessages || 'Failed to create case');
    }
    
    throw new Error(error.message || 'Failed to create case');
  }
}

export async function updateCase(id: string, data: Partial<CreateCaseData>): Promise<ClinicalCase> {
  try {
    console.log(`📤 Updating case ${id} with data:`, data);
    const response = await apiClient.put(`/cases/${id}/`, data);
    console.log('✅ Case updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error updating case ${id}:`, error);
    
    if (error.response?.data) {
      const errorMessages = Object.entries(error.response.data)
        .map(([field, messages]: [string, any]) => 
          `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
        )
        .join(' | ');
      throw new Error(errorMessages || 'Failed to update case');
    }
    
    throw new Error(error.message || 'Failed to update case');
  }
}

export async function updateCaseStatus(
  id: string, 
  status: 'non_approuve' | 'approuve' | 'rejete'
): Promise<ClinicalCase> {
  try {
    const response = await apiClient.patch(`/cases/${id}/`, { status });
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating case status ${id}:`, error);
    throw error;
  }
}

export async function deleteCase(id: string): Promise<void> {
  try {
    console.log(`🗑️ Deleting case ${id}`);
    await apiClient.delete(`/cases/${id}/`);
    console.log('✅ Case deleted successfully');
  } catch (error) {
    console.error(`❌ Error deleting case ${id}:`, error);
    throw error;
  }
}

// ============================================
// CATEGORIES API
// ============================================

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await apiClient.get('/categories/');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    throw error;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export async function getCasesByStatus(status: string): Promise<ClinicalCase[]> {
  try {
    const allCases = await getCases();
    return allCases.filter(c => c.status === status);
  } catch (error) {
    console.error('❌ Error filtering cases by status:', error);
    throw error;
  }
}

export async function getCasesStats() {
  try {
    const cases = await getCases();
    return {
      total: cases.length,
      non_approuve: cases.filter(c => c.status === 'non_approuve').length,
      approuve: cases.filter(c => c.status === 'approuve').length,
      rejete: cases.filter(c => c.status === 'rejete').length,
      byGender: {
        male: cases.filter(c => c.sexe.toLowerCase().includes('m')).length,
        female: cases.filter(c => c.sexe.toLowerCase().includes('f')).length,
      },
      avgAge: cases.length > 0 
        ? Math.round(cases.reduce((sum, c) => sum + c.age, 0) / cases.length)
        : 0,
    };
  } catch (error) {
    console.error('❌ Error calculating stats:', error);
    throw error;
  }
}