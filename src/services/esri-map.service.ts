import { Injectable } from '@angular/core';
import { isLoaded, loadModules, loadScript } from 'esri-loader';

@Injectable()
export class EsriMapService {

    private mapInstance: __esri.Map;

    public async getMap(): Promise<__esri.Map> {
        if (!!this.mapInstance) {
            return this.mapInstance;
        }
        const [Map, Basemap] = await loadModules([
            'esri/Map',
            'esri/Basemap'
        ]);
        if (!this.mapInstance) {
            this.mapInstance = new Map(
                { basemap: Basemap.fromId('streets') }
            );
        }
        return this.mapInstance;
    }

    public async createBasemapFromId(
        basemapId: string
    ): Promise<EsriWrapper<__esri.Basemap>> {
        const [Basemap] = await loadModules([
            'esri/Basemap'
        ]);
        const basemap = Basemap.fromId(basemapId);
        return { val: basemap };
    }

    public async createMap(
        props: __esri.MapProperties
    ): Promise<__esri.Map> {
        const [Map] = await loadModules([
            'esri/Map'
        ]);
        const map = new Map(props);
        return map;
    }

    public async createMapView(
        props: __esri.MapViewProperties
    ): Promise<EsriWrapper<__esri.MapView>> {
        const [MapView] = await loadModules([
            'esri/views/MapView'
        ]);
        const view: __esri.MapView = new MapView(props);
        return { val: view };
    }

    public async createSceneView(
        props: __esri.SceneViewProperties
    ): Promise<EsriWrapper<__esri.SceneView>> {
        const [SceneView] = await loadModules([
            'esri/views/SceneView'
        ]);
        const sceneView: __esri.SceneView = new SceneView(props);
        return { val: sceneView };
    }

    public async createLocalSource(
        props: __esri.BasemapProperties[]
    ): Promise<__esri.LocalBasemapsSource> {
        const basemapArr: __esri.Basemap[] = [];
        // tslint:disable-next-line:max-line-length
        const [Basemap, TileLayer, LocalBasemapsSource] = await loadModules([
            'esri/Basemap',
            'esri/layers/TileLayer',
            'esri/widgets/BasemapGallery/support/LocalBasemapsSource'
        ]);
        //
        for (const prop of props) {
            let baseLayers = prop.baseLayers as any[];
            baseLayers = baseLayers.map(
                opt => new TileLayer(opt)
            );
            prop.baseLayers = baseLayers;
            const basemap = new Basemap(prop);
            basemapArr.push(basemap);
        }
        const localSource = new LocalBasemapsSource({
            basemaps: basemapArr
        });
        return localSource;
    }

    public async createBasemapsGallery(
        galleryProperties: __esri.BasemapGalleryProperties,
        expandPropertis: __esri.ExpandProperties
    ): Promise<__esri.Expand> {
        const [Expand, BasemapGallery] = await loadModules([
            'esri/widgets/Expand',
            'esri/widgets/BasemapGallery'
        ]);
        galleryProperties.container = document.createElement('div');
        const gallery = new BasemapGallery(galleryProperties);
        expandPropertis.content = gallery.domNode;
        const expand = new Expand(expandPropertis);
        return expand;
    }
}

export interface EsriWrapper<T> {

    val: T;

}
