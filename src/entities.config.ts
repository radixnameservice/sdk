import { EntitiesConfigT } from "./common/entities.types";

const config: EntitiesConfigT = {

    stokenet: {
        components: {
            domainStorage: "component_tdx_2_1cpnsrtm2ym2t2sngjnehftfje4p2uu878f5crna6tlav247lf9lfzp",
            auctionStorage: "component_tdx_2_1cq8gxt2cxelfdmumvkp2364c4wlxmfagmlesjjpswypdsy2ph02yzj",
            feeService: "component_tdx_2_1crvys8f23k5escq0r9sldmlx73qwn3tcaug5agegxvx5tzfh2pef38",
            coreVersionManager: "component_tdx_2_1cr0u0hv8qdaq04mju8v8l4g7jcy6de99z8wmzfjwu36wx0g3n8ag9e",
        },
        resources: {
            collections: {
                launchCommemoration: "resource_tdx_2_1n2ldss7p470her9t5pfpk7kfexmhyu4g8d7hruzeueafdpnyfgzyj6",
                auctions: "resource_tdx_2_1ntspen5zzlsqxk0gzz0tkf63ujpqy6z6yr8k6n7dxd4aesnega5uex",
                domains: "resource_tdx_2_1n2leg5zgd0cw3766mdae43jg8dvp2h4x08rjjcrf3qrta8lhfjt7wq",
                records: "resource_tdx_2_1ng2r922evyvtzhdfdh4r2nqznw4zwkfesed296aclc5xqfr857t8mz"
            },
            badges: {
                serviceDeployment: "resource_tdx_2_1th944ku35qmtucwd7t2w5lvm3xqd09k749hyjgcjzaa8h2mj40w32p",
                upgrade: "resource_tdx_2_1t4na03y74pay3sgv5z2g42rmaq9tyhwae65y805346y8he30mxae3v",
                admin: "resource_tdx_2_1ntd6mwuffuwkpjydna3gf8gkpr645x6g03en43jea99rwdrrhud0nq",
                storage: "resource_tdx_2_1thq6txr9jwyzvprcfk27kjkv6709zh3n9w558j693e9sz2atjvkhhz",
                service: "resource_tdx_2_1t5wf4ku72kpkdpn7rz3xpuk85e78lmx23r4p2nm7fya60dfgef6z6y",
                rnsUser: "resource_tdx_2_1nt365sqsnadffshgcug835capwe807gj8d843zctm7pl6k4z5mrwxs",
                domainUser: "resource_tdx_2_1n2e0vndp449nxe2texzc9p8xysr68ac88jkrd7r6mmq46ve2kq7elq",
                auctionBid: "resource_tdx_2_1nt0fa0xvyur7nydvhkje2g7zmqq53st2xuk3ccyhsuns5f8ukhu5xr",
                actionClaims: "resource_tdx_2_1t540e0rkdpnrhgsegc9gr5zt4gsegcvwhlkuet9yjeqrtaf5lp6ygh",
                auctionSettlement: "resource_tdx_2_1nfjl9mjrtm59xhedm799n0a9g3zlp4fpjw59khtdjqgya2mjma3dcw",
                sunriseLandrushInitiativeSeed: "resource_tdx_2_1t4h065kewg4nnh3sp3a7esh27u0r57h6hkmgyr8022ap398v3zul50",
                activation: "resource_tdx_2_1t5uk6kvl75tn35gw9vcfaw9nkuzp420lzdqcvkum37u0hd0hegq7xn"
            },
            transients: {
                subdomainRecaller: "resource_tdx_2_1t5srx427ym99ng0jdd37606cdt3wfv2acu0dl0s2k4jx5nlqczg7tc"
            }
        }
    },

    mainnet: {
        components: {
            domainStorage: "component_rdx1czwr8xllz9ukgn6w3tst9u3ydgyv9yr9u5hs3dvy6thkgspfv2qqev",
            auctionStorage: "component_rdx1cp2ua070g0wxwf78exl7mdhs3qzwazsqaz65d4j5r4ggjvqfc37a79",
            feeService: "component_rdx1czuwlrcxf3pam04q25fxjdxcfczfdvn9z4p5h60upyyzxyle95awe9",
            coreVersionManager: "component_rdx1cqjpuxrsdvy7pjjym20h3fd96dpgf3nn8sejyu33kk0djm028gr3pt",
        },
        resources: {
            collections: {
                launchCommemoration: "resource_rdx1ng7k3v32y6zyyy98ctdp3deug9sdfhjy0u6f49yqr9m8l3zznrtfx9",
                auctions: "resource_rdx1ng4fj3h59nx6gm90p3xrxkrg2e6xa3epjnwlvaa6ar4a70gcfr23f0",
                domains: "resource_rdx1n2dd0w53zpdlqdz65vpymygj8a60vqnggyuxfpfdldjmy2224x020q",
                records: "resource_rdx1nf7lt68zan0fvlfqqrtnxasxjmv877ncnr2kpdl69t076sw4whjc27"
            },
            badges: {
                serviceDeployment: "resource_rdx1tkp8ptd9wmac20lt7als4wrdkzf5t60zlnplwdz09200xs2kwcmt8d",
                upgrade: "resource_rdx1t4qzvfn32unx3d3cwsf4whc20qzg4xekdut0yrtdvahhj3fd7kxhcs",
                admin: "resource_rdx1nf7y38stfprral843wajhpwc9thhehejep64efe0yhrkks5t3wvwk3",
                storage: "resource_rdx1t5psf5t5hupsuuvuw3ra0m7hgnvm93yaa5aqg2afnex42pqsmcfyec",
                service: "resource_rdx1th4j8c00c2escx9g0wcsqhu3p7jh7fu9gh3qdyqqkpdvsdj6xn0g5c",
                rnsUser: "resource_rdx1ngdf99zn80ytvu443l6kmk448mg9dpk6qt8h0ezxr7c62yemtl5928",
                domainUser: "resource_rdx1n2aktr583etff2502ek6s6a6sevvnvv63zzgstxgqvx5zh2wg0ckct",
                auctionBid: "resource_rdx1nfh6r0p8fy9qxr3arud0twj0v4vuptcxhuxyp0nuagx929wxy0nfz0",
                actionClaims: "resource_rdx1tken5hue8vrf7dp5rmy73296efrw7820jlvu0kgjxlfwphk342km0h",
                auctionSettlement: "resource_rdx1n2mjeg3z58y8ka8kz6ftpwef5cyfwc5fcvsudpuvxn9jxyn48ff0tn",
                sunriseLandrushInitiativeSeed: "resource_rdx1t5v0p43wlsd938zukmlqtwlafa6u8u8utyxfcthp0hq579dfhp6hyk",
                activation: "resource_rdx1t4h39eah5ax0dxu94esg04amnwak49c5xzvthn4k0khhs5dx88qa3s"
            },
            transients: {
                subdomainRecaller: "resource_rdx1tkxknmk2j360v2el84hen2k8jkhxlgtw980lfq73kszmjqm9rjxrz2"
            }
        }
    }

};

export default config;
