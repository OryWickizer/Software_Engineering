| Category | Question | Answer | Evidence |
|-----------|-----------|---------|-----------|
| **Q1 - Software Overview** | | | |
| Question 1.1 | Does your website and documentation provide a clear, high-level overview of your software? | ✅ | High-level overview in `proj2/README.md` and `proj2/docs/README.md` |
| Question 1.2 | Does your website and documentation clearly describe the type of user who should use your software? | ✅ | Target users described in `proj2/docs/why.md` (eco conscious users) |
| Question 1.3 | Do you publish case studies to show how your software has been used by yourself and others? | ❌ | No real case studies published |
| **Q2 - Identity** | | | |
| Question 2.1 | Is the name of your project/software unique? | ❌ | Several similarly named products, no service exactly like this |
| Question 2.2 | Is your project/software name free from trademark violations? | ❌ | No trademark clearance/process documented in repo |
| **Q3 - Availability** | | | |
| Question 3.1 | Is your software available as a package that can be deployed without building it? | ❌ | Can be easily cloned and ran |
| Question 3.2 | Is your software available for free? | ✅ | GNU AFFERO GENERAL PUBLIC LICENSE in `proj2/LICENSE.md`|
| Question 3.3 | Is your source code publicly available to download, either as a downloadable bundle or via access to a source code repository? | ✅ | Public repo structure present |
| Question 3.4 | Is your software hosted in an established, third-party repository like GitHub, BitBucket, LaunchPad, or SourceForge? | ✅ | Hosted on GitHub (badges and links in `proj2/README.md`) |
| **Q4 - Documentation** | | | |
| Question 4.1 | Is your documentation clearly available on your website or within your software? | ✅ | Docs in repo at `proj2/docs/` and guides in `proj2/INSTALL.md` |
| Question 4.2 | Does your documentation include a "quick start" guide, that provides a short overview of how to use your software with some basic examples of use? | ✅ | Quick start in `proj2/README.md:31` and `proj2/INSTALL.md` |
| Question 4.3 | If you provide more extensive documentation, does this provide clear, step-by-step instructions on how to deploy and use your software? | ✅ | Detailed docs in `proj2/INSTALL.md/` |
| Question 4.4 | Do you provide a comprehensive guide to all your software’s commands, functions and options? | ✅ | proj2/docs |
| Question 4.5 | Do you provide troubleshooting information that describes the symptoms and step-by-step solutions for problems and error messages? | ✅ | Troubleshooting sections in `proj2/INSTALL.md` |
| Question 4.6 | If your software can be used as a library, package or service by other software, do you provide comprehensive API documentation? | ❌ |  |
| Question 4.7 | Do you store your documentation under revision control with your source code? | ✅ | Documentation lives in repo under `proj2/docs/` |
| Question 4.8 | Do you publish your release history (release date, version numbers, key features, etc.) on your web site or in your documentation? | ✅ | Managed through Github Release|
| **Q5 - Support** | | | |
| Question 5.1 | Does your software describe how a user can get help with using your software? | ✅ | Users instructed to open issues; see `proj2/CONTRIBUTING.md` and `proj2/README.md` |
| Question 5.2 | Does your website and documentation describe what support, if any, you provide to users and developers? | ✅ | Contribution and support scope in `proj2/CONTRIBUTING.md` and `proj2/README.md` |
| Question 5.3 | Does your project have an e-mail address or forum that is solely for supporting users? | ❌ | No dedicated support email/forum documented in repo |
| Question 5.4 | Are e-mails to your support e-mail address received by more than one person? | ❌ | No support email configured; not applicable |
| Question 5.5 | Does your project have a ticketing system to manage bug reports and feature requests? | ✅ | GitHub Issues  |
| Question 5.6 | Is your project's ticketing system publicly visible to your users, so they can view bug reports and feature requests? | ✅ | GitHub Issues are public for the repository |
| **Q6 - Maintainability** | | | |
| Question 6.1 | Is your software’s architecture and design modular? | ❌ |  |
| Question 6.2 | Does your software use an accepted coding standard or convention? | ✅ | JavaScript ES6 ESM Module |
| **Q7 - Open Standards** | | | |
| Question 7.1 | Does your software allow data to be imported and exported using open data formats? | ✅ | Uses JSON (REST API), MongoDB (BSON) - all open formats |
| Question 7.2 | Does your software allow communications using open communications protocols? | ✅ | HTTP/HTTPS, WebSockets (Socket.io), REST API |
| **Q8 - Portability** | | | |
| Question 8.1 | Is your software cross-platform compatible? | ✅ | Web-based (works on any OS with browser) |
| **Q9 - Accessibility** | | | |
| Question 9.1 | Does your software adhere to appropriate accessibility conventions or standards? | ❌ | No explicit a11y policy/testing; no WCAG/ARIA guidance in repo |
| Question 9.2 | Does your documentation adhere to appropriate accessibility conventions or standards? | ✅ | All with Markdown format, which can be converted to HTML to provide accessability |
| **Q10 - Source Code Management** | | | |
| Question 10.1 | Is your source code stored in a repository under revision control? | ✅ | Git repository with GitHub CI configured (`.github/workflows/`) |
| Question 10.2 | Is each source code release a snapshot of the repository? | ✅ | Used Github Release and tags |
| Question 10.3 | Are releases tagged in the repository? | ✅ | Used Github Release and tags |
| Question 10.4 | Is there a branch of the repository that is always stable (i.e. tests always pass, code always builds successfully)? | ❌ |  |
| Question 10.5 | Do you back up your repository? | ✅ | Hosted on GitHub (redundant remote copy) |
| **Q11 - Building & Installing** | | | |
| Question 11.1 | Do you provide publicly-available instructions for building your software from the source code? | ✅ | Build/run instructions in `proj2/INSTALL.md` and `proj2/README.md` |
| Question 11.2 | Can you build, or package, your software using an automated tool? | ✅ | npm scripts for build (Vite for client, Node.js for server) |
| Question 11.3 | Do you provide publicly-available instructions for deploying your software? | ✅ | proj2/INSTALL.md |
| Question 11.4 | Does your documentation list all third-party dependencies? | ✅ | package.json files list dependencies |
| Question 11.5 | Does your documentation list the version number for all third-party dependencies? | ✅ | package.json includes version numbers |
| Question 11.6 | Does your software list the web address and licences for all third-party dependencies and say whether they are mandatory or optional? | ❌ | |
| Question 11.7 | Can you download dependencies using a dependency management tool or package manager? | ✅ | npm for all dependencies |
| Question 11.8 | Do you have tests that can be run after your software has been built or deployed to show whether the build or deployment has been successful? | ✅ | Jest test suite exists along with Vitest |
| **Q12 - Testing** | | | |
| Question 12.1 | Do you have an automated test suite for your software? | ✅ | Jest tests for backend, Vitest for frontend |
| Question 12.2 | Do you have a framework to periodically (e.g. nightly) run your tests on the latest version of the source code? | ❌ |  |
| Question 12.3 | Do you use continuous integration, automatically running tests whenever changes are made to your source code? | ✅ | GitHub Actions run tests on push |
| Question 12.4 | Are your test results publicly visible? | ✅ | CI badges and Codecov integration in `proj2/README.md` |
| Question 12.5 | Are all manually-run tests documented? | ❌ |  |
| **Q13 - Community Engagement** | | | |
| Question 13.1 | Does your project have resources (e.g. blog, Twitter, RSS feed, Facebook page, wiki, mailing list) that are regularly updated with information about your software? | ❌ | No external community channels documented in repo |
| Question 13.2 | Does your website state how many projects and users are associated with your project? | ❌ | No such metrics presented in `proj2/README.md` or docs |
| Question 13.3 | Do you provide success stories on your website? | ❌ | No success stories published in docs/README |
| Question 13.4 | Do you list your important partners and collaborators on your website? | ❌ | No partner/collaborator listing found |
| ~Question 13.5~ | ~Do you list your project's publications on your website or link to a resource where these are available?~ | | |
| Question 13.6 | Do you list third-party publications that refer to your software on your website or link to a resource where these are available? | ❌ | No third-party publications referenced |
| Question 13.7 | Can users subscribe to notifications about changes to your source code repository? | ✅ | GitHub watch/star provide notifications |
| Question 13.8 | If your software is developed as an open source project (and not just a project developing open source software), do you have a governance model? | ❌ |  |
| **Q14 - Contributions** | | | |
| Question 14.1 | Do you accept contributions (e.g. bug fixes, enhancements, documentation updates, tutorials) from people who are not part of your project? | ✅ | Stated in `proj2/CONTRIBUTING.md` |
| Question 14.2 | Do you have a contributions policy? | ✅ | `proj2/CONTRIBUTING.md` defines process and expectations |
| Question 14.3 | Is your contributions policy publicly available? | ✅ | Policy is in-repo and public (`proj2/CONTRIBUTING.md`) |
| Question 14.4 | Do contributors keep the copyright/IP of their contributions? | ✅ | proj2/CONTRIBUTING.md specifies that contributions are licensed under the project's GNU AFFERO GENERAL PUBLIC LICENSE
| **Q15 - Licensing** | | | |
| Question 15.1 | Does your website and documentation clearly state the copyright owners of your software and documentation? | ❌ | Owners not clearly stated; license present but no explicit copyright owner list |
| Question 15.2 | Does each of your source code files include a copyright statement? | ❌ | Source files generally lack per-file copyright headers |
| Question 15.3 | Does your website and documentation clearly state the licence of your software? | ✅ | License noted in `proj2/LICENSE` |
| Question 15.4 | Is your software released under an open source licence? | ✅ | GNU AFFERO GENERAL PUBLIC LICENSE in `proj2/LICENSE` |
| Question 15.5 | Is your software released under an OSI-approved open-source licence? | ✅ | GNU AFFERO GENERAL PUBLIC LICENSE is OSI-approved |
| Question 15.6 | Does each of your source code files include a licence header? | ❌ | No per-file license headers present |
| Question 15.7 | Do you have a recommended citation for your software? | ✅ | DOI badge |
| **Q16 - Future Plans** | | | |
| Question 16.1 | Does your website or documentation include a project roadmap (milestones for the next 3, 6 and 12 months)? | ✅ | Roadmap in `proj2/README.md:Development Roadmap` |
| Question 16.2 | Does your website or documentation describe how your project is funded, and the period over which funding is guaranteed? | ✅ | `proj2/README.md:Funding` |
| Question 16.3 | Do you make timely announcements of the deprecation of components, APIs, etc.? | ❌ |  |
