import Joi from "@hapi/joi";

const urlConfigSchema = Joi.object({
    name: Joi.string(),
    type: Joi.string(),
    url: Joi.string()
});

const componentConfigSchema = Joi.array().items(
    Joi.object({
        name: Joi.string(),
        path: Joi.string(),
        urlPaths: Joi.object().pattern(Joi.string(), Joi.string()),
        zeplinNames: Joi.array().items(Joi.string())
    })
);

const linkConfigSchema = Joi.object({
    barrels: Joi.array().items(Joi.string()),
    baseUrls: Joi.array().items(urlConfigSchema),
    components: Joi.array().items(componentConfigSchema)
});

export {
    urlConfigSchema,
    componentConfigSchema,
    linkConfigSchema
};
