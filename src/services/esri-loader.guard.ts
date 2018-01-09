import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot
} from '@angular/router';

import { ILoadScriptOptions, loadModules, loadScript } from 'esri-loader';

@Injectable()
export class EsriLoaderGuard implements CanActivate {

    constructor() { }

    public async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean> {
        try {
            const options = this.getOptions();
            // load esri script and dojoConfig;
            await loadScript({
                url: options.url,
                dojoConfig: options.dojoConfig
            });
            // add cors enabled hosts
            const [config] = await loadModules(['esri/config']);
            for (const host of options.corsEnabledHosts) {
                config.request.corsEnabledServers.push(host);
            }
            return true;
        }
        catch (ex) {
            console.error(ex);
            return false;
        }
    }

    public getOptions(): EsriGuardOptions {
        return {
            url: 'https://js.arcgis.com/4.6/init.js',
            dojoConfig: {
                locale: 'zh-cn',
                async: true
            },
            corsEnabledHosts: [
            ]
        };
    }

}

export interface EsriGuardOptions extends ILoadScriptOptions {
    corsEnabledHosts: CorsEnabledHost[];
}

export interface CorsEnabledHost {
    host: string;
    withCredentials: boolean;
}
