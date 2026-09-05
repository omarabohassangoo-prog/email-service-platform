import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, addDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ApiKey, EmailJob, EmailTemplate, ProviderConfig, AuditLog, AdminUser } from '../types';

/**
 * Google Cloud Firestore Enterprise Persistence Service
 * Seamlessly stores and queries ESP data in Google Cloud.
 */
export class FirestoreService {
  private static instance: FirestoreService;

  public static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  // --- API KEYS ---
  async saveApiKey(apiKey: ApiKey): Promise<void> {
    try {
      const docRef = doc(db, 'api_keys', apiKey.id);
      await setDoc(docRef, { ...apiKey }, { merge: true });
    } catch (err) {
      console.warn('[Firestore] Error saving API key:', err);
    }
  }

  async getApiKeys(): Promise<ApiKey[]> {
    try {
      const snapshot = await getDocs(collection(db, 'api_keys'));
      return snapshot.docs.map(d => d.data() as ApiKey);
    } catch (err) {
      console.warn('[Firestore] Error fetching API keys:', err);
      return [];
    }
  }

  async deleteApiKey(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'api_keys', id));
    } catch (err) {
      console.warn('[Firestore] Error deleting API key:', err);
    }
  }

  // --- EMAIL TEMPLATES ---
  async saveTemplate(template: EmailTemplate): Promise<void> {
    try {
      const docRef = doc(db, 'email_templates', template.id);
      await setDoc(docRef, { ...template }, { merge: true });
    } catch (err) {
      console.warn('[Firestore] Error saving template:', err);
    }
  }

  async getTemplates(): Promise<EmailTemplate[]> {
    try {
      const snapshot = await getDocs(collection(db, 'email_templates'));
      return snapshot.docs.map(d => d.data() as EmailTemplate);
    } catch (err) {
      console.warn('[Firestore] Error fetching templates:', err);
      return [];
    }
  }

  // --- EMAIL JOBS ---
  async saveEmailJob(job: EmailJob): Promise<void> {
    try {
      const docRef = doc(db, 'email_jobs', job.id);
      await setDoc(docRef, { ...job }, { merge: true });
    } catch (err) {
      console.warn('[Firestore] Error saving email job:', err);
    }
  }

  async getEmailJobs(limitCount: number = 50): Promise<EmailJob[]> {
    try {
      const q = query(collection(db, 'email_jobs'), limit(limitCount));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as EmailJob);
    } catch (err) {
      console.warn('[Firestore] Error fetching email jobs:', err);
      return [];
    }
  }

  // --- AUDIT LOGS ---
  async saveAuditLog(log: AuditLog): Promise<void> {
    try {
      const docRef = doc(db, 'audit_logs', log.id);
      await setDoc(docRef, { ...log }, { merge: true });
    } catch (err) {
      console.warn('[Firestore] Error saving audit log:', err);
    }
  }

  async getAuditLogs(limitCount: number = 100): Promise<AuditLog[]> {
    try {
      const q = query(collection(db, 'audit_logs'), limit(limitCount));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as AuditLog);
    } catch (err) {
      console.warn('[Firestore] Error fetching audit logs:', err);
      return [];
    }
  }
}

export const firestoreService = FirestoreService.getInstance();
