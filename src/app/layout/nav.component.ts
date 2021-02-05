import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-nav',
    templateUrl: 'nav.component.html',
})
export class NavComponent {
    items: any[] = [
        {
            link: '/vault',
            icon: 'fa-lock',
            label: 'My Vault',
        },
        {
            link: '/send',
            icon: 'fa-paper-plane',
            label: 'Send',
        },
    ];
}
