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
            "component_tdx_2_1czxsdqv09w657sxpjzd8rk5s6hmzwstu6c9c3zwqr74r6p0dz9pncj",
            "component_tdx_2_1czpytggaqjp9j6wxwakryzd3ktpqnu8g76gg8ced84gp8yl6csl6t3",
            "component_tdx_2_1cz2tyeeejgpjvrn59e5gm0fuw2znl3qgth0rwfgnha0udvxcmrdtfk",
            "component_tdx_2_1cpkdejrqvayt8jkyq56y9mtrne6hg8p4ca4z3p55jx2kgtwzzh7hu0",
            "resource_tdx_2_1t5hpxm9u6cavf0dnkcyx5acn43wpdqg8twe48am5w8e2fty3zzvht3",
            "resource_tdx_2_1t587g2cvh3vypr90f8hph2acuj962ffe2h4qxdaxja0hq4v3n3wsrw",
            "resource_tdx_2_1t4t7tzgkvvt3xkyz7yrwz2awvl56gkknkquh90ucuwsh3pf32nr57y",
            "resource_tdx_2_1n2r7meat8xu89e9kg90hn4f3rnz0tt7h3tzjsr78y38xq6z4g6emna",
            "resource_tdx_2_1th0e3d9ltqvjsq30fdtwl8a2l3gdzdxrs6aj2gzmdpw8n082ex2d5d",
            "resource_tdx_2_1nt6vqs4xc38n8y9yn82xju86wvzctjv7vp8hl2fx2729pmmlhxwe6p",
            "resource_tdx_2_1nthh3rjuh69q94llrdc95nd876yc02alqqq27krn7gkpsycvd79mm3",
            "resource_tdx_2_1n234c0k8em8ndjyaa4mz0s663hawv08ukl38dpy50shgt73wk4warr",
            "resource_tdx_2_1ntxatdxkr0lqh3066zgacdafa4t93jmpj094czyks3hlj8e9eugr2t",
            "resource_tdx_2_1tk6g5j8dym6r9r3my3a6jhlchwpr25zl927sq3njtl0aennv0gq3l8",
            "resource_tdx_2_1th5u2hz5yv9fuz7j65l20rjg4cy7x8rgjygjc6mpu6jwtyn9r0teq2",
            "resource_tdx_2_1n2lxrnueznjuxv64p0fuga8wxmee2hklzffwpsp302seg0zrkg0st7",
            "resource_tdx_2_1ntjeav86mt3xe6ua7n76cmq29pym8cr2w9368ek9xdjf2yhqz3f3qt",
            "resource_tdx_2_1t42ja8e2v8lj6tjgv99fvjtchx95erge2d66g054he7fx4m00urxv0",
        ],
    },

    mainnet: {
        entities: [],
    }

};

export default config;
