import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from '../../core/services/message.service';
import { AuthService, AuthUser } from '../../core/services/auth.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy {
  contacts: AuthUser[] = [];
  selectedContact: AuthUser | null = null;
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
    this.loadContacts();
    this.intervalId = setInterval(() => {
      if (this.selectedContact) {
        this.loadConversation(this.selectedContact._id);
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
        // Filtrer pour ne garder que les médecins
        this.contacts = contacts.filter(c => c.role === 'medecin');
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des contacts.';
        this.loading = false;
      }
    });
  }

  selectContact(contact: AuthUser): void {
    this.selectedContact = contact;
    if (contact) {
      this.loadConversation(contact._id);
    } else {
      this.messages = [];
    }
  }

  loadConversation(otherUserId: string): void {
    this.loading = true;
    this.messageService.getConversation(otherUserId).subscribe({
      next: (msgs: any[]) => {
        this.messages = msgs.map(m => ({
          from: m.fromSelf ? 'Moi' : (m.fromName || 'Lui'),
          text: m.contenu || m.text
        }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement de la conversation.';
        this.loading = false;
      }
    });
  }

  send(): void {
    if (!this.newMsg.trim() || !this.selectedContact) return;
    const destinataireId = this.selectedContact._id;
    const contenu = this.newMsg.trim();
    this.messageService.sendMessage(destinataireId, contenu).subscribe({
      next: () => {
        this.messages.push({ from: 'Moi', text: contenu });
        this.newMsg = '';
      },
      error: () => {
        this.error = 'Erreur lors de l\'envoi du message.';
      }
    });
  }
}
