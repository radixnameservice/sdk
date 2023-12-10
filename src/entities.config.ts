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
            "component_tdx_2_1cqkps9lzley0tygxgv9x9ds4tj3nsknvxp6d78nysgqyq95qumhfly",
            "component_tdx_2_1cqncd0p3yuwf72u0f040v0jur6q6mz7jfluzgvt4pzuw5l6vu66y5q",
            "component_tdx_2_1cq2px4hhyls7fvdy5ryxuym2m5zd88teenxv7mngv9tq6q3zzmz4ya",
            "resource_tdx_2_1t5qvqmmd77vrns0qqhzw8whkt9e8ul2s7vnnzyvg6qy8qaw9ymc635",
            "resource_tdx_2_1t5ykysusc0pu5mlxgu9y2h8adls4t7acag0wxxzg5g9q5fu6yyy87p",
            "resource_tdx_2_1n20mf4s02zsjh3293g9f6rnv7vx4pgte6774w6dlz59cclsrjzw7xr",
            "resource_tdx_2_1ntne6hu9fktun2gd5rkrqpwnyw7mr5knj4yh3mvylht4w6r6qtrwxj",
            "resource_tdx_2_1ng55g7m6k7ucw5jvz98al5wpwplv28shrwn8s3f8lf6789r6l577x8",
            "resource_tdx_2_1ng3tlx0qq3pe8tahgpke6e7tz4mh8sgapz9n3yvtehm6r3yud8q2cz",
            "resource_tdx_2_1nfr2un83ewsjw05ftcu40j5xx5huzy0a233kyfg5p9xmmjesufx7us",
            "resource_tdx_2_1ntcp42au6wfjql3y5tk3e9f2p4tzyshask6s9982n0xm29399t2fes",
            "resource_tdx_2_1nflqkdre2fk0vg4rsn5nrhtgss4myn42phkec6d23zxflnav42sc78",
            "resource_tdx_2_1ngj0jqvez5qukdtkevnlzulpf7s6a9d05855kax0gpqtuwzv06gcps",
        ],
    },

    mainnet: {
        entities: [],
    }

};

export default config;