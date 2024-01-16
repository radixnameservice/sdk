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
            "package_tdx_2_1phnahn60cnwfc6uthhr279r8j2ua2mza9xvu5qrs5m7w2h3p5ckuda", // Storage Package
            "package_tdx_2_1p4e68p7fvcgl5fvq5qgh7mxu27haeuraadzad3hartgc9qdtru9kvt", // Logic Package
            "component_tdx_2_1crxgeaev7v3nqjc7jxrkgd50k76yuxhfz95d8l8c69gkcngu7ntng4",
            "resource_tdx_2_1t5uxv532qegv2e3v4xk9ql5awn0ysarfgsceph3kacx5dpnj0ss6hd",
            "resource_tdx_2_1t5znazf29w9tscfaqde939dpxkzj34z675h2uanqakldt4dzr9yv8v",
            "resource_tdx_2_1t4gy9mmv05wjh7u4w6xwk40ty7at40dx40x3edkg2xh9hy8w8gv4e6",
            "resource_tdx_2_1ntm458h9ce002qnpdq92frmdt7cef4l290zevmajypzqgxllcvsk82",
            "resource_tdx_2_1t55ewknf8q6shnhjwj7acjymsg3hggd7tyvz56zu7vhtf3vcvxlgrf",
            "resource_tdx_2_1ngux36yrxhgzrzdpcn94al8whv0e5za58ekwrea9x0rejpaladmfmt",
            "resource_tdx_2_1ng6wvacqput50psewq5j5gg04rtt9uwns5rq23a7556e5st4kh74gx",
            "resource_tdx_2_1ntstt7ryafhe7f5npjvs36cyhe4cj3ps9j2vw7tfnm9tjy23svwvt4",
            "resource_tdx_2_1ntdjmmykn8g9d2ag4vkxh2a3capx59guwg0ut3a2xe40rlz3uffs09",
            "component_tdx_2_1cpwsp5f03jphfpfpjgcmcgxz0rckkd3vs3fjlh4dz4y43hdhde6hs3",
            "component_tdx_2_1cqwa78s3tgs7nmp4k96h9apt9trj9vazhxpjezh0tzf5qqnpnm5nsh",
            "resource_tdx_2_1n2d26p2fkqpad6kc997xk4egk5xl0z5vn5dy7esjk556r9s5fs5ytw",
            "resource_tdx_2_1ntm65xw3v670hkaf24we077xev8p44fsk0gxcpnwxhlaaf2t9966ey",
            "component_tdx_2_1cpm7mcqnpll2kyae7ynk265f2dmuesd9w3l2ydqn3tm8put84wuj7f",
            "resource_tdx_2_1thdvph9clkzzclsh9zm4wt2u4qr3xz2suz9j9xnlyy802fmck6kaxg",
        ],
    },

    mainnet: {
        entities: [],
    }

};

export default config;