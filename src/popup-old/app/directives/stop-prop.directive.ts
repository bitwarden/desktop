export function StopPropDirective() {
    return (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
        element[0].addEventListener('click', (e) => {
            e.stopPropagation();
        });
    };
}
