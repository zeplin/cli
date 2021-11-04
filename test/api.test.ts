import Axios from "axios";
import * as samples from "./samples";
import { mocked } from "ts-jest/utils";
import { ZeplinApi } from "../src/api";
import { APIError, CLIError } from "../src/errors";

jest.mock("axios");

describe("ZeplinApi", () => {
    beforeEach(() => {
        jest.resetAllMocks();

        mocked(Axios.create).mockImplementation(() => Axios);
    });

    describe("login()", () => {
        it("returns login response when HTTP request succeeds", async () => {
            const zeplinApi = new ZeplinApi();

            mocked(Axios.post).mockResolvedValueOnce({ data: samples.loginResponse });

            await expect(zeplinApi.login(samples.loginRequest))
                .resolves
                .toBe(samples.loginResponse);

            expect(Axios.post).toHaveBeenCalledWith("/users/login", samples.loginRequest);
        });

        it("throws APIError when HTTP request fails", async () => {
            const zeplinApi = new ZeplinApi();

            mocked(Axios.post).mockRejectedValueOnce(samples.axiosError);

            await expect(zeplinApi.login(samples.loginRequest))
                .rejects
                .toThrowError(new APIError(samples.axiosError.response));

            expect(Axios.post).toHaveBeenCalledWith("/users/login", samples.loginRequest);
        });

        it("throws CLIError when non-HTTP error occurs", async () => {
            const zeplinApi = new ZeplinApi();

            const errorMessage = "some other error";
            mocked(Axios.post).mockRejectedValueOnce(new Error(errorMessage));

            await expect(zeplinApi.login(samples.loginRequest))
                .rejects
                .toThrowError(new CLIError(errorMessage));

            expect(Axios.post).toHaveBeenCalledWith("/users/login", samples.loginRequest);
        });
    });

    describe("generateToken()", () => {
        it("returns token response when HTTP request succeeds", async () => {
            const zeplinApi = new ZeplinApi();

            mocked(Axios.get).mockResolvedValueOnce({
                headers: {
                    location: "url:port?access_token=wowmuchaccesstoken"
                }
            });

            await expect(zeplinApi.generateToken(samples.loginResponse.token))
                .resolves
                .toBe("wowmuchaccesstoken");

            expect(Axios.get).toHaveBeenCalledWith(
                "/oauth/authorize",
                expect.objectContaining(samples.generateTokenAxiosRequest)
            );
        });

        it("throws APIError when HTTP request fails", async () => {
            const zeplinApi = new ZeplinApi();

            mocked(Axios.get).mockRejectedValueOnce(samples.axiosError);

            await expect(zeplinApi.generateToken(samples.loginResponse.token))
                .rejects
                .toThrowError(new APIError(samples.axiosError.response));

            expect(Axios.get).toHaveBeenCalledWith(
                "/oauth/authorize",
                expect.objectContaining(samples.generateTokenAxiosRequest)
            );
        });

        it("throws CLIError when non-HTTP error occurs", async () => {
            const zeplinApi = new ZeplinApi();

            const errorMessage = "some other error";
            mocked(Axios.get).mockRejectedValueOnce(new Error(errorMessage));

            await expect(zeplinApi.generateToken(samples.loginResponse.token))
                .rejects
                .toThrowError(new CLIError(errorMessage));

            expect(Axios.get).toHaveBeenCalledWith(
                "/oauth/authorize",
                expect.objectContaining(samples.generateTokenAxiosRequest)
            );
        });
    });

    describe("uploadConnectedComponents()", () => {
        it("resolves when HTTP request succeeds", async () => {
            const zeplinApi = new ZeplinApi();

            await zeplinApi.uploadConnectedComponents(
                samples.validJwt,
                samples.uploadParams,
                samples.connectedComponentList
            );

            const { barrelType, barrelId } = samples.uploadParams;

            expect(Axios.put).toHaveBeenCalledWith(
                `/public/cli/v2/${barrelType}/${barrelId}/connectedcomponents`,
                samples.connectedComponentList,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });

        it("throws APIError when HTTP request fails", async () => {
            const zeplinApi = new ZeplinApi();

            mocked(Axios.put).mockRejectedValueOnce(samples.axiosError);

            await expect(
                zeplinApi.uploadConnectedComponents(
                    samples.validJwt,
                    samples.uploadParams,
                    samples.connectedComponentList
                )
            ).rejects.toThrowError(new APIError(samples.axiosError.response));

            const { barrelType, barrelId } = samples.uploadParams;

            expect(Axios.put).toHaveBeenCalledWith(
                `/public/cli/v2/${barrelType}/${barrelId}/connectedcomponents`,
                samples.connectedComponentList,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });

        it("throws CLIError when non-HTTP error occurs", async () => {
            const zeplinApi = new ZeplinApi();

            const errorMessage = "some other error";
            mocked(Axios.put).mockRejectedValueOnce(new Error(errorMessage));

            await expect(
                zeplinApi.uploadConnectedComponents(
                    samples.validJwt,
                    samples.uploadParams,
                    samples.connectedComponentList
                )
            ).rejects.toThrowError(new CLIError(errorMessage));

            const { barrelType, barrelId } = samples.uploadParams;

            expect(Axios.put).toHaveBeenCalledWith(
                `/public/cli/v2/${barrelType}/${barrelId}/connectedcomponents`,
                samples.connectedComponentList,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });
    });

    describe("deleteConnectedComponents()", () => {
        it("resolves when HTTP request succeeds", async () => {
            const zeplinApi = new ZeplinApi();

            await zeplinApi.deleteConnectedComponents(
                samples.validJwt,
                samples.deleteParams
            );

            const { barrelType, barrelId } = samples.deleteParams;

            expect(Axios.delete).toHaveBeenCalledWith(
                `/public/cli/v2/${barrelType}/${barrelId}/connectedcomponents`,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });

        it("throws APIError when HTTP request fails", async () => {
            const zeplinApi = new ZeplinApi();

            mocked(Axios.delete).mockRejectedValueOnce(samples.axiosError);

            await expect(
                zeplinApi.deleteConnectedComponents(
                    samples.validJwt,
                    samples.deleteParams
                )
            ).rejects.toThrowError(new APIError(samples.axiosError.response));

            const { barrelType, barrelId } = samples.uploadParams;

            expect(Axios.delete).toHaveBeenCalledWith(
                `/public/cli/v2/${barrelType}/${barrelId}/connectedcomponents`,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });

        it("throws CLIError when non-HTTP error occurs", async () => {
            const zeplinApi = new ZeplinApi();

            const errorMessage = "some other error";
            mocked(Axios.delete).mockRejectedValueOnce(new Error(errorMessage));

            await expect(
                zeplinApi.deleteConnectedComponents(
                    samples.validJwt,
                    samples.deleteParams
                )
            ).rejects.toThrowError(new CLIError(errorMessage));

            const { barrelType, barrelId } = samples.deleteParams;

            expect(Axios.delete).toHaveBeenCalledWith(
                `/public/cli/v2/${barrelType}/${barrelId}/connectedcomponents`,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });
    });

    describe("getProjects()", () => {
        it("resolves when HTTP request succeeds", async () => {
            const zeplinApi = new ZeplinApi();

            mocked(Axios.get).mockResolvedValueOnce({ data: samples.getProjectsResponse });

            await expect(zeplinApi.getProjects(samples.validJwt))
                .resolves
                .toBe(samples.getProjectsResponse);

            expect(Axios.get).toHaveBeenCalledWith(
                `/public/cli/projects`,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });

        it("throws APIError when HTTP request fails", async () => {
            const zeplinApi = new ZeplinApi();

            mocked(Axios.get).mockRejectedValueOnce(samples.axiosError);

            await expect(
                zeplinApi.getProjects(samples.validJwt)
            ).rejects.toThrowError(new APIError(samples.axiosError.response));

            expect(Axios.get).toHaveBeenCalledWith(
                `/public/cli/projects`,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });

        it("throws CLIError when non-HTTP error occurs", async () => {
            const zeplinApi = new ZeplinApi();

            const errorMessage = "some other error";
            mocked(Axios.get).mockRejectedValueOnce(new Error(errorMessage));

            await expect(
                zeplinApi.getProjects(samples.validJwt)
            ).rejects.toThrowError(new CLIError(errorMessage));

            expect(Axios.get).toHaveBeenCalledWith(
                `/public/cli/projects`,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });
    });

    describe("getProject()", () => {
        it("resolves when HTTP request succeeds", async () => {
            const zeplinApi = new ZeplinApi();

            mocked(Axios.get).mockResolvedValueOnce({ data: samples.getProjectResponse });

            const projectId = samples.getProjectResponse._id;

            await expect(zeplinApi.getProject(samples.validJwt, projectId))
                .resolves
                .toBe(samples.getProjectResponse);

            expect(Axios.get).toHaveBeenCalledWith(
                `/public/cli/projects/${projectId}`,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });

        it("throws APIError when HTTP request fails", async () => {
            const zeplinApi = new ZeplinApi();

            mocked(Axios.get).mockRejectedValueOnce(samples.axiosError);

            const projectId = samples.getProjectResponse._id;

            await expect(
                zeplinApi.getProject(samples.validJwt, projectId)
            ).rejects.toThrowError(new APIError(samples.axiosError.response));

            expect(Axios.get).toHaveBeenCalledWith(
                `/public/cli/projects/${projectId}`,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });

        it("throws CLIError when non-HTTP error occurs", async () => {
            const zeplinApi = new ZeplinApi();

            const errorMessage = "some other error";
            mocked(Axios.get).mockRejectedValueOnce(new Error(errorMessage));

            const projectId = samples.getProjectResponse._id;

            await expect(
                zeplinApi.getProject(samples.validJwt, projectId)
            ).rejects.toThrowError(new CLIError(errorMessage));

            expect(Axios.get).toHaveBeenCalledWith(
                `/public/cli/projects/${projectId}`,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });
    });

    describe("getStyleguides()", () => {
        it("resolves when HTTP request succeeds", async () => {
            const zeplinApi = new ZeplinApi();

            mocked(Axios.get).mockResolvedValueOnce({ data: samples.getStyleguidesResponse });

            await expect(zeplinApi.getStyleguides(samples.validJwt))
                .resolves
                .toBe(samples.getStyleguidesResponse);

            expect(Axios.get).toHaveBeenCalledWith(
                `/public/cli/styleguides`,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });

        it("throws APIError when HTTP request fails", async () => {
            const zeplinApi = new ZeplinApi();

            mocked(Axios.get).mockRejectedValueOnce(samples.axiosError);

            await expect(
                zeplinApi.getStyleguides(samples.validJwt)
            ).rejects.toThrowError(new APIError(samples.axiosError.response));

            expect(Axios.get).toHaveBeenCalledWith(
                `/public/cli/styleguides`,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });

        it("throws CLIError when non-HTTP error occurs", async () => {
            const zeplinApi = new ZeplinApi();

            const errorMessage = "some other error";
            mocked(Axios.get).mockRejectedValueOnce(new Error(errorMessage));

            await expect(
                zeplinApi.getStyleguides(samples.validJwt)
            ).rejects.toThrowError(new CLIError(errorMessage));

            expect(Axios.get).toHaveBeenCalledWith(
                `/public/cli/styleguides`,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });
    });

    describe("getStyleguide()", () => {
        it("resolves when HTTP request succeeds", async () => {
            const zeplinApi = new ZeplinApi();

            mocked(Axios.get).mockResolvedValueOnce({ data: samples.getStyleguideResponse });

            const styleguideId = samples.getStyleguideResponse._id;

            await expect(zeplinApi.getStyleguide(samples.validJwt, styleguideId))
                .resolves
                .toBe(samples.getStyleguideResponse);

            expect(Axios.get).toHaveBeenCalledWith(
                `/public/cli/styleguides/${styleguideId}`,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });

        it("resolves when HTTP request with parent styleguide succeeds", async () => {
            const zeplinApi = new ZeplinApi();

            mocked(Axios.get).mockResolvedValueOnce({ data: samples.getStyleguideResponse });

            const styleguideId = samples.getStyleguideResponse._id;

            const parentStyleguideId = "540b91990ffebc59619fa195";

            await expect(
                zeplinApi.getStyleguide(
                    samples.validJwt,
                    styleguideId,
                    {
                        linkedStyleguideId: parentStyleguideId
                    }
                )
            ).resolves.toBe(samples.getStyleguideResponse);

            expect(Axios.get).toHaveBeenCalledWith(
                `/public/cli/styleguides/${styleguideId}`,
                {
                    headers: {
                        "Zeplin-Access-Token": samples.validJwt,
                        "zeplin-styleguide-id": parentStyleguideId
                    }
                }
            );
        });

        it("resolves when HTTP request with parent project succeeds", async () => {
            const zeplinApi = new ZeplinApi();

            mocked(Axios.get).mockResolvedValueOnce({ data: samples.getStyleguideResponse });

            const styleguideId = samples.getStyleguideResponse._id;

            const parentProjectId = "540b91990ffebc59619fa195";

            await expect(
                zeplinApi.getStyleguide(
                    samples.validJwt,
                    styleguideId,
                    {
                        linkedProjectId: parentProjectId
                    }
                )
            ).resolves.toBe(samples.getStyleguideResponse);

            expect(Axios.get).toHaveBeenCalledWith(
                `/public/cli/styleguides/${styleguideId}`,
                {
                    headers: {
                        "Zeplin-Access-Token": samples.validJwt,
                        "zeplin-project-id": parentProjectId
                    }
                }
            );
        });

        it("throws APIError when HTTP request fails", async () => {
            const zeplinApi = new ZeplinApi();

            mocked(Axios.get).mockRejectedValueOnce(samples.axiosError);

            const styleguideId = samples.getStyleguideResponse._id;

            await expect(
                zeplinApi.getStyleguide(samples.validJwt, styleguideId)
            ).rejects.toThrowError(new APIError(samples.axiosError.response));

            expect(Axios.get).toHaveBeenCalledWith(
                `/public/cli/styleguides/${styleguideId}`,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });

        it("throws CLIError when non-HTTP error occurs", async () => {
            const zeplinApi = new ZeplinApi();

            const errorMessage = "some other error";
            mocked(Axios.get).mockRejectedValueOnce(new Error(errorMessage));

            const styleguideId = samples.getProjectResponse._id;

            await expect(
                zeplinApi.getStyleguide(samples.validJwt, styleguideId)
            ).rejects.toThrowError(new CLIError(errorMessage));

            expect(Axios.get).toHaveBeenCalledWith(
                `/public/cli/styleguides/${styleguideId}`,
                { headers: { "Zeplin-Access-Token": samples.validJwt } }
            );
        });
    });
});
