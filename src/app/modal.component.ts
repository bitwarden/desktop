import {
    Component,
    ComponentFactoryResolver,
    EventEmitter,
    OnDestroy,
    Output,
    Type,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

@Component({
    selector: 'app-modal',
    template: `<ng-template #container></ng-template>`,
})
export class ModalComponent implements OnDestroy {
    @Output() onClose = new EventEmitter();
    @Output() onClosed = new EventEmitter();
    @Output() onShow = new EventEmitter();
    @Output() onShown = new EventEmitter();
    @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;
    parentContainer: ViewContainerRef = null;
    fade: boolean = true;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

    ngOnDestroy() {
        document.body.classList.remove('modal-open');
        document.body.removeChild(document.querySelector('.modal-backdrop'));
    }

    show<T>(type: Type<T>, parentContainer: ViewContainerRef, fade: boolean = true): T {
        this.onShow.emit();
        this.parentContainer = parentContainer;
        this.fade = fade;

        document.body.classList.add('modal-open');
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop' + (this.fade ? ' fade' : '');
        document.body.appendChild(backdrop);

        const factory = this.componentFactoryResolver.resolveComponentFactory<T>(type);
        const componentRef = this.container.createComponent<T>(factory);

        document.querySelector('.modal-dialog').addEventListener('click', (e: Event) => {
            e.stopPropagation();
        });

        for (const closeElement of document.querySelectorAll('.modal, .modal *[data-dismiss="modal"]')) {
            closeElement.addEventListener('click', (event) => {
                this.close();
            });
        }

        this.onShown.emit();
        return componentRef.instance;
    }

    close() {
        this.onClose.emit();
        this.onClosed.emit();
        if (this.parentContainer != null) {
            this.parentContainer.clear();
        }
    }
}
