import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from '../../core/services/message.service';
import { AuthService, AuthUser } from '../../core/services/auth.service';

@Component({
  selector: 'app-medecin-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MedecinMessagesComponent implements OnInit, OnDestroy {

  contacts: AuthUser[] = [];
  debugContacts: any = null;
  selectedContact: string = '';
  messages: Array<{ from: string; text: string }> = [];
  newMsg = '';
  loading = false;
  error = '';
  private intervalId: any;

  constructor(
    public messageService: MessageService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // Pour test UI : injecter des contacts factices si la liste est vide après 1s
    this.loadContacts();
    setTimeout(() => {
      if (!this.contacts || this.contacts.length === 0) {
        this.contacts = [
          { _id: '1', nom: 'Patient', prenom: 'Test', email: 'patient1@test.com', role: 'patient' },
          { _id: '2', nom: 'Patient', prenom: 'Demo', email: 'patient2@test.com', role: 'patient' }
        ];
        this.debugContacts = this.contacts;
        console.warn('Contacts factices injectés pour test UI');
      }
    }, 1000);
    this.intervalId = setInterval(() => {
      if (this.selectedContact) {
        this.loadConversation(this.selectedContact);
      }
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  loadContacts(): void {
    this.loading = true;
    this.messageService.getContacts().subscribe({
      next: (contacts: AuthUser[]) => {
        this.contacts = contacts;
        this.debugContacts = contacts;
        this.loading = false;
        // Debug: log dans la console navigateur
        console.log('Contacts API:', contacts);
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Impossible de charger les contacts.';
        this.loading = false;
      }
    });
  }

  selectContact(contactId: string): void {
    this.selectedContact = contactId;
    // Ne charge plus la conversation automatiquement
    // L'utilisateur doit cliquer sur le bouton
    this.messages = [];
  }

  onSelectContact(): void {
    if (this.selectedContact) {
      this.loadConversation(this.selectedContact);
    }
  }

  loadConversation(otherUserId: string): void {
    this.loading = true;
    this.messageService.getConversation(otherUserId).subscribe({
      next: (msgs: any[]) => {
        const currentUser = this.authService.getCurrentUser();
        this.messages = msgs.map((m: any) => ({
          from: m.from === currentUser?._id ? 'Moi' : (m.fromName || 'Lui'),
          text: m.text
        }));
        this.loading = false;
        setTimeout(() => {
          const box = document.querySelector('.chat-container');
          if (box) (box as HTMLElement).scrollTop = box.scrollHeight;
        }, 100);
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Impossible de charger la conversation.';
        this.loading = false;
      }
    });
  }

  send(): void {
    if (!this.newMsg.trim() || !this.selectedContact) return;
    const destinataireId = this.selectedContact;
    const contenu = this.newMsg.trim();
    this.messageService.sendMessage(destinataireId, contenu).subscribe({
      next: () => {
        this.newMsg = '';
        this.loadConversation(destinataireId);
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Erreur lors de l\'envoi du message.';
      }
    });
  }
}

