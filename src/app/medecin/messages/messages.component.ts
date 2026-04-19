import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy {

  patients: any[] = [];
  selectedPatient: any = null;
  messages: any[] = [];
  newMsg = '';

  userId: string = '';
  private intervalId: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user._id; // ✅ important

    this.loadPatients();

    // 🔥 auto refresh messages
    this.intervalId = setInterval(() => {
      if (this.selectedPatient) {
        this.loadMessages();
      }
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  ////////////////////////////////////////////////////

  loadPatients() {
    this.http.get<any[]>('http://localhost:3000/api/medecin/patients')
      .subscribe({
        next: (res) => this.patients = res,
        error: (err) => console.error('❌ patients error:', err)
      });
  }

  ////////////////////////////////////////////////////

  selectPatient(p: any) {
    this.selectedPatient = p;
    this.loadMessages();
  }

  ////////////////////////////////////////////////////

  loadMessages() {
    if (!this.selectedPatient) return;

    this.http.get<any[]>(
      `http://localhost:3000/api/messages/${this.selectedPatient._id}`
    ).subscribe({
      next: (res) => {
        console.log('📩 messages:', res);

        // 🔥 FIX IMPORTANT (ObjectId → string)
        this.messages = res.map((m: any) => ({
          ...m,
          from: m.from?.toString(),
          to: m.to?.toString()
        }));

        // 🔥 scroll auto
        setTimeout(() => {
          const box = document.querySelector('.chat-container');
          if (box) box.scrollTop = box.scrollHeight;
        }, 100);
      },
      error: (err) => console.error('❌ messages error:', err)
    });
  }

  ////////////////////////////////////////////////////

  send() {
    if (!this.newMsg.trim() || !this.selectedPatient) return;

    const payload = {
      to: this.selectedPatient._id,
      text: this.newMsg
    };

    this.http.post('http://localhost:3000/api/messages', payload)
      .subscribe({
        next: () => {
          this.newMsg = '';
          this.loadMessages(); // 🔥 refresh direct
        },
        error: (err) => console.error('❌ send error:', err)
      });
  }
}