export function StopClickDirective() {
    // ref: https://stackoverflow.com/a/14165848/1090359
    return (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
        element[0].addEventListener('click', (e) => {
            e.preventDefault();
        });
    };
}
