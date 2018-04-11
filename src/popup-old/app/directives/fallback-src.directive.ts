export function FallbackSrcDirective() {
    return (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
        element[0].addEventListener('error', (e: any) => {
            e.target.src = attrs.fallbackSrc;
        });
    };
}
