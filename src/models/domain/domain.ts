import { CipherString } from '../domain/cipherString';

export default abstract class Domain {
    protected buildDomainModel(model: any, obj: any, map: any, alreadyEncrypted: boolean, notEncList: any[] = []) {
        for (const prop in map) {
            if (!map.hasOwnProperty(prop)) {
                continue;
            }

            const objProp = obj[(map[prop] || prop)];
            if (alreadyEncrypted === true || notEncList.indexOf(prop) > -1) {
                model[prop] = objProp ? objProp : null;
            } else {
                model[prop] = objProp ? new CipherString(objProp) : null;
            }
        }
    }

    protected async decryptObj(model: any, map: any, orgId: string) {
        const promises = [];
        const self: any = this;

        for (const prop in map) {
            if (!map.hasOwnProperty(prop)) {
                continue;
            }

            // tslint:disable-next-line
            (function (theProp) {
                const p = Promise.resolve().then(() => {
                    const mapProp = map[theProp] || theProp;
                    if (self[mapProp]) {
                        return self[mapProp].decrypt(orgId);
                    }
                    return null;
                }).then((val: any) => {
                    model[theProp] = val;
                });
                promises.push(p);
            })(prop);
        }

        await Promise.all(promises);
        return model;
    }
}
