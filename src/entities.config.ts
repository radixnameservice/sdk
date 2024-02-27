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
            "component_tdx_2_1cplldyya27nf9va6y44kdvpvl08rycctravfhwsyzzz6p8fmld7mqr",
            "component_tdx_2_1cp57n9ah8apuhmvwrjnl54h9py7k203a0esvldtpvjem9szhn0aazw",
            "component_tdx_2_1cpu86w80f96f7kvf7ewgs0h8sqe8hntraa27jp9v7ezgk3zxmmq82r",
            "component_tdx_2_1crv3lmrtg67f0j4gjflnfs4wwk9y6m48mjvr5sykvyjef3z9vdssu6",
            "resource_tdx_2_1t5t9lllfe097hp7zdk2f3jr298n4xphqy6dv8wmh6h2m3khdnvcvwf",
            "resource_tdx_2_1nge5jtcx0mdz0932jk7lg6hp5xea8aut3g6csmagfxvrce4ekafld3",
            "resource_tdx_2_1t4gp5fvwpjq8w8uy6vj5h6f6j3mcuk0tdysl977tjt7rf86a6fg3u0",
            "resource_tdx_2_1thdkmt4rthjsdqst4qcwefeq7nhe73md0398s7smqyhtpzazzsppa3",
            "resource_tdx_2_1n2g3v0jj2hfyygrv9adcyq6mkfv6yt4clyq7td4u5qu0fjengu0x8c",
            "resource_tdx_2_1thpjmltcydzu5l023tksfmamntmvdnpkykm0dnyr76d6saw287wr5p",
            "resource_tdx_2_1ngx5dhxd2t09z58l472huquc5ntxwnma2j94shu9rhrzypm97mh5mv",
            "resource_tdx_2_1n2fek6qeqh7m7kf5g9uh4cqqxzrupuluww2ycs33uvc8e8kyp56mt7",
            "resource_tdx_2_1ntrnhlghju7l74zt2nf3ashred0qnxf3hgtp0al7a3q2vrxm2axtw8",
            "resource_tdx_2_1nftwc77gyldj5ce4xsdvg0zn2s4y4hj02t2h2apg4ls3wmy0cpezpf",
            "resource_tdx_2_1t54yuatkgxhqg3vjmkwqe5nlmwnjuttvglpz2kpzfr5j29pccsagme",
            "resource_tdx_2_1thvyafhq859wlzpjq5tuuqkr8jy4q42clw29wxl6y7vjk0eedkmgjr",
            "resource_tdx_2_1tk79ms56kxylf6mzhfnmw28w2mnzl0efjq6sj6vq49vwujztd3uydf",
            // "resource_tdx_2_1n2xpa6fsyrzdk4xe0y5kx6waje8ajwyr5fstwqzt6lhgtkct52ys4a",
            "resource_tdx_2_1n2swzj8cur4j5je2w6ev8v7zmyg38avg7lnzfuvygek8r9r9srlwux",
            "resource_tdx_2_1ntv2llnf2g98rr9se2muxfxhgrtyrps5sy8ndraxq7c27px3xfekcs",
            "resource_tdx_2_1tkz2zxemy596vvms8955y53wd7kuymzt76r3y8hzak2jh7rhjcq039",
        ],
    },

    mainnet: {
        entities: [],
    }

};

export default config;
