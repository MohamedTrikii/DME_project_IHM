import { Component } from '@angular/core';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent {
messages = [
  { from: 'Dr Ali', text: 'Bonjour' },
  { from: 'Moi', text: 'Merci docteur' }
];

newMsg = '';

send() {
  if (this.newMsg) {
    this.messages.push({ from: 'Moi', text: this.newMsg });
    this.newMsg = '';
  }
}
}
