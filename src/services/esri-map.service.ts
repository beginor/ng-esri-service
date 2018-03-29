import { Injectable } from '@angular/core';
import { isLoaded, loadModules, loadScript } from 'esri-loader';

@Injectable()
export class EsriMapService {

    // tslint:disable-next-line:ban-types
    private sceneViewResolvers: Function[] = [];
    private sceneView: __esri.SceneView;
    // tslint:disable-next-line:ban-types
    private mapViewResolvers: Function[] = [];
    private mapView: __esri.MapView;

    public getSceneView(): Promise<EsriWrapper<__esri.SceneView>> {
        const promise = new Promise<any>((resolve, reject) => {
            if (this.sceneView) {
                resolve({ val: this.sceneView });
                return;
            }
            this.sceneViewResolvers.push(resolve);
        });
        return promise;
    }

    public setSceneView(view: __esri.SceneView) {
        this.sceneView = view;
        if (this.sceneViewResolvers.length > 0) {
            const wrapper = { val: this.sceneView };
            this.sceneViewResolvers.forEach(resolve => {
                resolve(wrapper);
            });
            this.sceneViewResolvers.length = 0;
        }
    }

    public getMapView(): Promise<EsriWrapper<__esri.MapView>> {
        const promise = new Promise<any>((resolve, reject) => {
            if (this.mapView) {
                resolve({ val: this.mapView });
                return;
            }
            this.mapViewResolvers.push(resolve);
        });
        return promise;
    }

    public setMapView(view: __esri.MapView) {
        this.mapView = view;
        if (this.mapViewResolvers.length > 0) {
            const wrapper = { val: this.mapView };
            this.mapViewResolvers.forEach(resolve => {
                resolve(wrapper);
            });
            this.mapViewResolvers.length = 0;
        }
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

    public async createQuery(
        queryProps?: __esri.QueryProperties
    ): Promise<__esri.Query> {
        const [Query] = await loadModules([
            'esri/tasks/support/Query'
        ]);
        return new Query(queryProps);
    }

    public async createQueryTask(
        queryTaskProps?: __esri.QueryTaskProperties
    ): Promise<__esri.QueryTask> {
        const [QueryTask] = await loadModules([
            'esri/tasks/QueryTask'
        ]);
        return new QueryTask(queryTaskProps);
    }

    public executeQuery(serviceUrl: string, query: __esri.Query): Promise<any> {
        const promise = new Promise((resolve, reject) => {
            loadModules(['esri/tasks/QueryTask'])
                .then(([QueryTask]) => {
                    const queryTask: __esri.QueryTask = new QueryTask({
                        url: serviceUrl
                    });
                    queryTask.execute(query).then(
                        (res: any) => resolve(res),
                        (err: any) => reject(err)
                    );
                })
                .catch(ex => reject(ex));
        });
        return promise;
    }

    public async executeQuery2(
        url: string,
        queryProps: __esri.QueryProperties
    ): Promise<any> {
        const query = await this.createQuery(queryProps);
        return this.executeQuery(url, query);
    }

    public queryFeatures(
        url: string,
        query: __esri.Query
    ): Promise<__esri.FeatureSet> {
        return this.executeQuery(url, query);
    }

    public async queryFeatures2(
        url: string,
        queryProps: __esri.QueryProperties
    ): Promise<__esri.FeatureSet> {
        return await this.executeQuery2(url, queryProps);
    }

    public async createGraphic(
        graphicProps?: __esri.GraphicProperties
    ): Promise<__esri.Graphic> {
        const [Graphic] = await loadModules([
            'esri/Graphic'
        ]);
        return new Graphic(graphicProps);
    }

    public findViewForLayer<TLayer extends __esri.Layer, TLayerView>(
        view: __esri.View,
        layer: TLayer
    ): Promise<EsriWrapper<TLayerView>> {
        return new Promise<any>((resolve, reject) => {
            view.whenLayerView(layer)
                .then(layerView => {
                    resolve({ val: layerView });
                })
                .otherwise(err => {
                    reject(err);
                });
        });
    }

    public buffer(
        geometryServiceUrl: string,
        props: __esri.BufferParametersProperties
    ): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            loadModules([
                'esri/tasks/GeometryService',
                'esri/tasks/support/BufferParameters'
            ]).then(([GeometryService, BufferParameters]) => {
                const geoSvc: __esri.GeometryService
                    = new GeometryService({ url: geometryServiceUrl });
                const params: __esri.BufferParameters = new BufferParameters(
                    props
                );
                geoSvc.buffer(params)
                    .then(result => resolve(result))
                    .otherwise(ex => reject(ex));
            });
        });
    }

    /**
     * Wrap featureLayer.queryFeatures as ES6 Promise
     * @param layer feature layer
     * @param queryProps query props
     */
    public queryLayerFeatures(
        layer: __esri.FeatureLayer,
        queryProps: __esri.QueryProperties
    ): Promise<__esri.FeatureSet> {
        return new Promise<__esri.FeatureSet>((resolve, reject) => {
            const query = layer.createQuery();
            Object.assign(query, queryProps);
            layer.queryFeatures(query)
                .then((result: __esri.FeatureSet) => {
                    resolve(result);
                })
                .otherwise(err => {
                    reject(err);
                });
        });
    }

    /**
     * Wrap `sceneView.goTo` as ES6 Promise
     */
    public sceneViewgoTo(
        view: __esri.SceneView,
        target: any,
        options?: __esri.SceneViewGoToOptions
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            view.goTo(target, options)
                .then(() => resolve())
                .otherwise(err => reject(err));
        });
    }

    /**
     * 查询图层在地图视图上显示的图形
     * @param view scene view
     * @param layer feature layer
     * @param where definitionExpression of the feature layer
     */
    public queryLayerGraphics(
        view: __esri.SceneView,
        layer: __esri.FeatureLayer,
        where: string
    ): Promise<__esri.Graphic[]> {
        return new Promise<__esri.Graphic[]>((resolve, reject) => {
            view.whenLayerView(layer)
                .then((layerView: __esri.FeatureLayerView) => {
                    if (where === layer.definitionExpression) {
                        layerView.queryFeatures()
                            .then((graphics: __esri.Graphic[]) => {
                                resolve(graphics);
                            })
                            .otherwise(err => {
                                reject(err);
                            });
                    }
                    else {
                        const handle = layerView.watch('updating', val => {
                            if (!val) {
                                layerView.queryFeatures()
                                    .then((graphics: __esri.Graphic[]) => {
                                        handle.remove();
                                        resolve(graphics);
                                    })
                                    .otherwise(err => {
                                        handle.remove();
                                        reject(err);
                                    });
                            }
                        });
                        layer.definitionExpression = where;
                    }
                })
                .otherwise(err => {
                    reject(err);
                });
        });
    }

    public async parseRendererFromJSON<T extends __esri.UniqueValueRenderer>(
        json: any
    ): Promise<T> {
        const [jsonUtils] = await loadModules([
            'esri/renderers/support/jsonUtils'
        ]);
        return jsonUtils.fromJSON(json);
    }

    public async createSimpleLineSymbol(
        color: string | number[],
        width: number,
        style: string
    ): Promise<__esri.SimpleLineSymbol> {
        const [SimpleLineSymbol, Color] = await loadModules([
            'esri/symbols/SimpleLineSymbol',
            'esri/Color'
        ]);
        return new SimpleLineSymbol({
            color: new Color(color),
            width,
            style: 'short-dot'
        });
    }

    public async createSimpleFillSymbol(
        color: number[],
        styles: string,
        out: any
    ): Promise<__esri.SimpleFillSymbol> {
        const [SimpleFillSymbol, Color] = await loadModules([
            'esri/symbols/SimpleFillSymbol',
            'esri/Color'
        ]);
        return new SimpleFillSymbol({
            color: new Color(color),
            style: styles,
            outline: out
        });
    }

    public async parseWebSceneFromJSON(
        json: any
    ): Promise<EsriWrapper<__esri.WebScene>> {
        const [WebScene] = await loadModules([
            'esri/WebScene'
        ]);
        return { val: WebScene.fromJSON(json) };
    }

    public async webMercatorToGeographic(
        extent: __esri.Geometry
    ): Promise<__esri.Geometry> {
        const [webMercatorUtils] = await loadModules([
            'esri/geometry/support/webMercatorUtils'
        ]);
        return webMercatorUtils.webMercatorToGeographic(extent);
    }

    public async createSlideFromView(
        view: any,
        options?: any
    ): Promise<__esri.Slide> {
        const [Slide] = await loadModules([
            'esri/webscene/Slide'
        ]);
        return Slide.createFrom(view, options);
    }

    public async createExtent(
        extentProperties: __esri.ExtentProperties
    ): Promise<__esri.Extent> {
        const [Extent] = await loadModules([
            'esri/geometry/Extent'
        ]);
        return new Extent(extentProperties);
    }

    public async createPoint(
        pointProps: __esri.PointProperties
    ): Promise<__esri.Point> {
        const [Point] = await loadModules([
            'esri/geometry/Point'
        ]);
        return new Point(pointProps);
    }

    public async createPointSymbol3D(
        pointSymbol3DProps: __esri.PointSymbol3DProperties
    ): Promise<__esri.PointSymbol3D> {
        const [PointSymbol3D] = await loadModules([
            'esri/symbols/PointSymbol3D'
        ]);
        return new PointSymbol3D(pointSymbol3DProps);
    }

    public async createIconSymbol3DLayer(
        iconSymbol3DLayerProps: __esri.IconSymbol3DLayerProperties
    ): Promise<__esri.IconSymbol3DLayer> {
        const [IconSymbol3DLayer] = await loadModules([
            'esri/symbols/IconSymbol3DLayer'
        ]);
        return new IconSymbol3DLayer(iconSymbol3DLayerProps);
    }

    public async createPopupTemplate(
        popupTemplateProps: __esri.PopupTemplateProperties
    ): Promise<__esri.PopupTemplate> {
        const [PopupTemplate] = await loadModules([
            'esri/PopupTemplate'
        ]);
        return new PopupTemplate(popupTemplateProps);
    }

    public getViewResolution(): number {
        if (!this.sceneView) {
            return 0;
        }
        const mapWidth = this.sceneView.extent.width;
        const viewWidth = this.sceneView.width;
        const resoluation = Math.ceil(mapWidth / viewWidth);
        return resoluation;
    }

    public async createAction(
        actionProperties: __esri.ActionProperties
    ): Promise<__esri.Action> {
        const [Action] = await loadModules([
            'esri/support/Action'
        ]);
        return new Action(actionProperties);
    }

    public async createField(
        fieldProperties?: __esri.FieldProperties
    ): Promise<__esri.Field> {
        const [Field] = await loadModules([
            'esri/layers/support/Field'
        ]);
        return new Field(fieldProperties);
    }

    public async parseLabelClassFromJSON(
        json: any
    ): Promise<__esri.LabelClass> {
        const [LabelClass] = await loadModules([
            'esri/layers/support/LabelClass'
        ]);
        return LabelClass.fromJSON(json);
    }

    public async parseSymbolFromJson<T extends __esri.Symbol>(
        json: any
    ): Promise<T> {
        const [jsonUtils] = await loadModules([
            'esri/symbols/support/jsonUtils'
        ]);
        return jsonUtils.fromJSON(json);
    }

    public async createColor(
        colorProperties: any
    ): Promise<__esri.Color> {
        const [Color] = await loadModules([
            'esri/Color'
        ]);
        return new Color(colorProperties);
    }

    public async parsePresentationFromJSON(
        json: any
    ): Promise<__esri.Presentation> {
        const [Presentation] = await loadModules([
            'esri/webscene/Presentation'
        ]);
        return Presentation.fromJSON(json);
    }

    public async createLegend(
        legendProps: __esri.LegendProperties,
        expandProps: __esri.ExpandProperties
    ): Promise<__esri.Expand> {
        const [Expand, Legend] = await loadModules([
            'esri/widgets/Expand',
            'esri/widgets/Legend'
        ]);
        legendProps.container = document.createElement('div');
        const legend = new Legend(legendProps);
        expandProps.view = legendProps.view;
        expandProps.content = legend.domNode;
        const expand: __esri.Expand = new Expand(expandProps);
        return expand;
    }

    public async createImageryLayer(
        props: __esri.ImageryLayerProperties
    ): Promise<EsriWrapper<__esri.ImageryLayer>> {
        const [ImageryLayer] = await loadModules([
            'esri/layers/ImageryLayer'
        ]);
        const layer = new ImageryLayer(props);
        return { val: layer };
    }

    public async createMapImage(
        props: __esri.MapImageProperties
    ): Promise<EsriWrapper<__esri.MapImage>> {
        const [MapImage] = await loadModules([
            'esri/layers/support/MapImage'
        ]);
        const image = new MapImage(props);
        return { val: image };
    }

    public async createMapImageLayer(
        props: __esri.MapImageLayerProperties
    ): Promise<EsriWrapper<__esri.MapImageLayer>> {
        const [MapImageLayer] = await loadModules([
            'esri/layers/MapImageLayer'
        ]);
        const layer = new MapImageLayer(props);
        return { val: layer };
    }

    public async createGraphicsLayer(
        props: __esri.GraphicsLayerProperties
    ): Promise<EsriWrapper<__esri.GraphicsLayer>> {
        const [GraphicsLayer] = await loadModules([
            'esri/layers/GraphicsLayer'
        ]);
        const layer = new GraphicsLayer(props);
        return { val: layer };
    }

    public async createWebTileLayer(
        props: __esri.WebTileLayerProperties
    ): Promise<EsriWrapper<__esri.WebTileLayer>> {
        const [WebTileLayer] = await loadModules([
            'esri/layers/WebTileLayer'
        ]);
        const layer = new WebTileLayer(props);
        return { val: layer };
    }

    public async createBasemap(
        props: __esri.BasemapProperties
    ): Promise<EsriWrapper<__esri.Basemap>> {
        const [Basemap] = await loadModules([
            'esri/Basemap'
        ]);
        const basemap = new Basemap(props);
        return { val: basemap };
    }

    public async createFeatureLayer(
        props: __esri.FeatureLayerProperties
    ): Promise<EsriWrapper<__esri.FeatureLayer>> {
        const [FeatureLayer] = await loadModules([
            'esri/layers/FeatureLayer'
        ]);
        const layer: __esri.FeatureLayer = new FeatureLayer(props);
        return { val: layer };
    }

    public async parseFeatureSetFromJson(
        json: any
    ): Promise<__esri.FeatureSet> {
        const [FeatureSet] = await loadModules([
            'esri/tasks/support/FeatureSet'
        ]);
        const result: __esri.FeatureSet = FeatureSet.fromJSON(json);
        return result;
    }

    public async createCollection<T>(
        items: T[]
    ): Promise<__esri.Collection<T>> {
        const [Collection] = await loadModules([
            'esri/core/Collection'
        ]);
        const result: __esri.Collection = new Collection(items);
        return result;
    }

}

export interface EsriWrapper<T> {

    val: T;

}
