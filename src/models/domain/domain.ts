import { CipherString } from '../domain/cipherString';

export default abstract class Domain {
    protected buildDomainModel(model: any, obj: any, map: any, alreadyEncrypted: boolean, notEncList: any = []) {
        for (var prop in map) {
            if (map.hasOwnProperty(prop)) {
                var objProp = obj[(map[prop] || prop)];
                if (alreadyEncrypted === true || notEncList.indexOf(prop) > -1) {
                    model[prop] = objProp ? objProp : null;
                } else {
                    model[prop] = objProp ? new CipherString(objProp) : null;
                }
            }
        }
    }

    protected async decryptObj(model: any, self: any, map: any, orgId: string) {
        var promises = [];
        for (let prop in map) {
            if (!map.hasOwnProperty(prop)) {
                continue;
            }
            
            (function (theProp) {
                let promise = Promise.resolve().then(function () {
                    var mapProp = map[theProp] || theProp;
                    if (self[mapProp]) {
                        return self[mapProp].decrypt(orgId);
                    }
                    return null;
                }).then(function (val) {
                    model[theProp] = val;
                    return;
                });
                promises.push(promise);
            })(prop);
        }

        await Promise.all(promises);
        return model;
    }
}