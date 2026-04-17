import { Component } from '@angular/core';

@Component({
  selector: 'app-ordonnance',
  templateUrl: './ordonnance.component.html'
})
export class OrdonnanceComponent {

ordonnances = [
  { medicament: 'Doliprane', dosage: '500mg', duree: '5 jours' },
  { medicament: 'Ibuprofène', dosage: '200mg', duree: '3 jours' }
];
}