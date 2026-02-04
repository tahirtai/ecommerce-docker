import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    const counters = document.querySelectorAll('.counter') as NodeListOf<HTMLElement>;
    counters.forEach(counter => {
      const updateCount = () => {
        const target = +counter.getAttribute('data-target')!;
        const count = +counter.innerText.replace(/\D/g, '');
        const increment = target / 100;

        if (count < target) {
          counter.innerText = Math.ceil(count + increment).toString() + (counter.innerText.includes('%') ? '%' : '+');
          setTimeout(updateCount, 30);
        } else {
          counter.innerText = target.toLocaleString() + (counter.innerText.includes('%') ? '%' : '+');
        }
      };
      updateCount();
    });
  }
}
