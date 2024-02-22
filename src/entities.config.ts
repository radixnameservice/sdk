import { NetworkT } from "./utils/gateway.utils";

type EntitiesT = string[];

type EntitiesConfigT = {

    [key in NetworkT]: {
        entities: EntitiesT
    };

};

const config: EntitiesConfigT = {

    stokenet: {
        entities: [
            "component_tdx_2_1cz8j9ftps2ry347cwtskrrghg4vderc8ksn2alv3fszla5stl2jmff",
            "component_tdx_2_1czfcqpf9c8cslt3hqt9qjc95jxhv7n6wdd2yldc2nuk444gk5vxgdp",
            "component_tdx_2_1cr4mn3wd7stc4w2pwujrmrdnhrsk6yf47ld8nwkpdnck8a4j74d5l9",
            "component_tdx_2_1cp2rz4favp2taqgxwh85xrkgpyef7myk3k7e4x0zasaec80sr232nw",
            "resource_tdx_2_1th72s35sme4skdlvyyjq3es7vxr7thnlsmhth03qtqtlcza2d2zzvu",
            "resource_tdx_2_1t4qn0kjpdysyk2qv2dw9y4r573k0my9c3ew7a96cfv0ts4z8qn3p00",
            "resource_tdx_2_1t4xm87asdt758nth8mqll7s73yy2n82xr8c5tf9394m96ea5448n52",
            "resource_tdx_2_1t5efzdt9y7u2v8ztl6a8xfk3ry79vsk6qt0y36fzld049wgn4m7f0d",
            "resource_tdx_2_1ng0jf0st55xdpqmhse8j8tfv24zdfsulhduyjjk0ycqeat85enxjrt",
            "resource_tdx_2_1t4v6ej4d0xt2a7c87cllh9fq2g4k9fv40kdsdl5ugftqcq3gn7xmdx",
            "resource_tdx_2_1ngmlt2rctpu8v8hf5g06zsaguxheu37jhknjfr4g4wphcz49rdk6l3",
            "resource_tdx_2_1ntahayzn7xqecfxffmdelszcgu2q0u76dx32hw2vhtn8yp20mkrddg",
            "resource_tdx_2_1nfkkhhmcsywxw36zc6kgn0qq2hdfyhf5ujqzeafw3rks0795ulhlpq",
            "resource_tdx_2_1n235m67d0dwe4jtyent9hg5m3c4evh0ap6leg2agz6srnqdgy4a79v",
            "resource_tdx_2_1thx6l9l06utk5mv0z7az9jux3lww9c5mv3fyxgyt5g58ewel37yaly",
            "resource_tdx_2_1t5eadvf52x8d474f6hgy8dpdtmtvxy3un8eel5fu2g0s98r33nqau9",
            "resource_tdx_2_1nfrx3p3c7mzd8na9lqh9uwpwx0d9jfpt36gj2q59xajsjvpwsyjaz2",
            "resource_tdx_2_1n2wcx2l7czz8cytt4dfyvrp0cqlt4pcllgl9e0mfq9nv3m9x2aup98",
            "resource_tdx_2_1thecvhr7ztctglpy66a29rv9fwcptvf5ygvljud5l7v63fpal8upqv",
        ],
    },

    mainnet: {
        entities: [],
    }

};

export default config;
