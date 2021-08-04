import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
// @ts-ignore
import flag from 'cozy-flags';

/**
 * A directive that allows to render a component only if the correct flag is set to TRUE
 *
 * usage: <div *ifFlag="some.flag.name"></div>
 */
@Directive({ selector: '[ifFlag]'})
export class IfFlagDirective implements OnInit, OnDestroy {
  private isFlagEnabled = false;
  private hasView = false;
  private flagName: string;

  @Input() set ifFlag(flagName: string) {
    this.flagName = flagName;
    this.flagChanged();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) { }

  ngOnDestroy(): void {
      flag.store.removeListener('change', this.flagChanged.bind(this));
  }

  ngOnInit() {
      flag.store.on('change', this.flagChanged.bind(this));

      this.flagChanged();
  }

  flagChanged() {
      this.isFlagEnabled = flag(this.flagName);

      if (this.isFlagEnabled && !this.hasView) {
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.hasView = true;
      } else if (!this.isFlagEnabled && this.hasView) {
          this.viewContainer.clear();
          this.hasView = false;
      }
  }
}