import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { NgFor } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { COUNTRIES, CountryCode } from './country-codes';

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule],
  template: `
    <div class="phone-wrap">
      <mat-form-field appearance="outline" class="country-select" subscriptSizing="dynamic">
        <mat-select [formControl]="countryCtrl" (selectionChange)="onCountryChange()">
          <mat-option *ngFor="let c of countries" [value]="c.iso">
            <span class="flag">{{ c.flag }}</span>
            <span class="dial">{{ c.dial }}</span>
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="phone-input" subscriptSizing="dynamic">
        <mat-label>Teléfono</mat-label>
        <input matInput [formControl]="phoneCtrl" (input)="onPhoneChange()" [placeholder]="currentMask" type="tel">
      </mat-form-field>
    </div>
  `,
  styles: [`
    .phone-wrap {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .country-select {
      width: 120px;
      flex-shrink: 0;
    }
    .phone-input {
      flex: 1;
    }
    .flag {
      font-size: 1.2rem;
      margin-right: 0.35rem;
    }
    .dial {
      font-weight: 500;
    }

    @media (max-width: 600px) {
      .phone-wrap { gap: 0.35rem; }
      .country-select { width: 90px; }
    }
  `],
})
export class PhoneInputComponent {
  readonly value = input<string>('');
  readonly phoneChange = output<string>();

  readonly countries: CountryCode[] = COUNTRIES;

  countryCtrl = new FormControl('CL');
  phoneCtrl = new FormControl('');
  currentMask = '9 9999 9999';

  private emitValue(): void {
    const country = this.countries.find((c) => c.iso === this.countryCtrl.value);
    if (!country) return;
    const digits = (this.phoneCtrl.value || '').replace(/\D/g, '');
    this.phoneChange.emit(`${country.dial}${digits}`);
  }

  onCountryChange(): void {
    const country = this.countries.find((c) => c.iso === this.countryCtrl.value);
    if (country) this.currentMask = country.mask;
    this.emitValue();
  }

  onPhoneChange(): void {
    this.emitValue();
  }
}
