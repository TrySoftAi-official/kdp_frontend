import { 
  getKdpLoginStatus
} from '@/services/additionalService';

export interface KdpSession {
  isConnected: boolean;
  lastConnected?: string;
  expiresAt?: string;
  email?: string;
}

export interface KdpLoginStatus {
  logged_in: boolean;
  email?: string;
  expires_at?: string;
}

export class KdpService {
  private static instance: KdpService;
  private readonly SESSION_KEY = 'amazon_kdp_session';
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {}

  public static getInstance(): KdpService {
    if (!KdpService.instance) {
      KdpService.instance = new KdpService();
    }
    return KdpService.instance;
  }

  /**
   * Get cached KDP session from localStorage
   */
  public getCachedSession(): KdpSession | null {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);

      if (expiresAt > now && session.isConnected) {
        return {
          isConnected: true,
          lastConnected: session.lastConnected,
          expiresAt: session.expiresAt,
          email: session.email || 'Connected'
        };
      } else {
        // Session expired, clear it
        this.clearSession();
        return null;
      }
    } catch (error) {
      console.error('Error parsing cached KDP session:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Save KDP session to localStorage
   */
  public saveSession(session: KdpSession): void {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving KDP session:', error);
    }
  }

  /**
   * Clear KDP session from localStorage
   */
  public clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Error clearing KDP session:', error);
    }
  }

  /**
   * Check KDP login status from API
   */
  public async checkLoginStatus(): Promise<KdpLoginStatus> {
    try {
      const response = await getKdpLoginStatus();
      return response.data;
    } catch (error) {
      console.error('Error checking KDP login status from API:', error);
      throw error;
    }
  }

  /**
   * Create a new KDP session
   */
  public createSession(email: string = 'Connected'): KdpSession {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_DURATION);

    return {
      isConnected: true,
      lastConnected: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      email
    };
  }

  /**
   * Verify and refresh KDP session
   */
  public async verifySession(showLoading = false): Promise<{
    session: KdpSession;
    fromCache: boolean;
    needsRefresh: boolean;
  }> {
    // First check cached session
    const cachedSession = this.getCachedSession();
    
    if (cachedSession) {
      return {
        session: cachedSession,
        fromCache: true,
        needsRefresh: false
      };
    }

    // No valid cached session, check with API
    try {
      const loginStatus = await this.checkLoginStatus();
      
      if (loginStatus?.logged_in) {
        const newSession = this.createSession(loginStatus.email);
        this.saveSession(newSession);
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('kdp-session-updated'));
        
        return {
          session: newSession,
          fromCache: false,
          needsRefresh: false
        };
      } else {
        return {
          session: { isConnected: false },
          fromCache: false,
          needsRefresh: false
        };
      }
    } catch (error) {
      console.error('Error verifying KDP session:', error);
      
      // If API call fails, return disconnected session
      return {
        session: { isConnected: false },
        fromCache: false,
        needsRefresh: true
      };
    }
  }

  /**
   * Handle successful KDP connection
   */
  public handleConnectionSuccess(): KdpSession | null {
    const sessionData = localStorage.getItem(this.SESSION_KEY);
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (session.isConnected) {
          const kdpSession: KdpSession = {
            isConnected: true,
            lastConnected: session.lastConnected,
            expiresAt: session.expiresAt,
            email: session.email || 'Connected'
          };
          
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('kdp-session-updated'));
          
          return kdpSession;
        }
      } catch (error) {
        console.error('Error parsing session data:', error);
      }
    }
    return null;
  }

  /**
   * Check if session is expired
   */
  public isSessionExpired(session: KdpSession): boolean {
    if (!session.expiresAt) return true;
    
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    return expiresAt <= now;
  }

  /**
   * Get session time remaining in milliseconds
   */
  public getSessionTimeRemaining(session: KdpSession): number {
    if (!session.expiresAt) return 0;
    
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    return Math.max(0, expiresAt.getTime() - now.getTime());
  }

  /**
   * Format session time remaining as human readable string
   */
  public formatSessionTimeRemaining(session: KdpSession): string {
    const timeRemaining = this.getSessionTimeRemaining(session);
    
    if (timeRemaining === 0) return 'Expired';
    
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  }

  /**
   * Validate KDP session data
   */
  public validateSession(session: any): session is KdpSession {
    return (
      typeof session === 'object' &&
      session !== null &&
      typeof session.isConnected === 'boolean' &&
      (session.lastConnected === undefined || typeof session.lastConnected === 'string') &&
      (session.expiresAt === undefined || typeof session.expiresAt === 'string') &&
      (session.email === undefined || typeof session.email === 'string')
    );
  }
}

// Export singleton instance
export const kdpService = KdpService.getInstance();
