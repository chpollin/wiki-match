// TEI XML Parser Service
const TEIParser = {
    parsedXML: null,
    originalXMLString: null,
    TEI_NAMESPACE: 'http://www.tei-c.org/ns/1.0',

    /**
     * Parse TEI XML file
     * @param {File} file - TEI XML file to parse
     * @returns {Promise<Object>} Parsed entities from listPerson, listPlace, listOrg
     */
    async parse(file) {
        Logger.info('TEI', `Parsing TEI XML file: ${file.name} (${Utils.formatFileSize(file.size)})`);

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const xmlString = e.target.result;
                    this.originalXMLString = xmlString;

                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

                    // Check for parsing errors
                    const parserError = xmlDoc.querySelector('parsererror');
                    if (parserError) {
                        throw new Error('XML parsing error: ' + parserError.textContent);
                    }

                    this.parsedXML = xmlDoc;

                    const entities = this.extractEntities(xmlDoc);
                    Logger.success('TEI', `Extracted ${entities.totalCount} entities`, {
                        persons: entities.persons.length,
                        places: entities.places.length,
                        orgs: entities.orgs.length,
                        concepts: entities.concepts.length
                    });

                    resolve(entities);
                } catch (error) {
                    Logger.error('TEI', 'Failed to parse TEI XML', error);
                    reject(error);
                }
            };

            reader.onerror = () => {
                const error = new Error('Failed to read file');
                Logger.error('TEI', 'File read error', error);
                reject(error);
            };

            reader.readAsText(file);
        });
    },

    /**
     * Extract entities from TEI XML document
     */
    extractEntities(xmlDoc) {
        const entities = {
            persons: [],
            places: [],
            orgs: [],
            concepts: [],
            totalCount: 0
        };

        // Extract persons
        const personElements = this.getElementsNS(xmlDoc, 'person');
        personElements.forEach((personEl, index) => {
            const person = this.extractPerson(personEl, index);
            if (person) {
                entities.persons.push(person);
            }
        });

        // Extract places
        const placeElements = this.getElementsNS(xmlDoc, 'place');
        placeElements.forEach((placeEl, index) => {
            const place = this.extractPlace(placeEl, index);
            if (place) {
                entities.places.push(place);
            }
        });

        // Extract organizations
        const orgElements = this.getElementsNS(xmlDoc, 'org');
        orgElements.forEach((orgEl, index) => {
            const org = this.extractOrg(orgEl, index);
            if (org) {
                entities.orgs.push(org);
            }
        });

        // Extract taxonomy/category terms
        const categoryElements = this.getElementsNS(xmlDoc, 'category');
        categoryElements.forEach((categoryEl, index) => {
            const concept = this.extractCategory(categoryEl, index);
            if (concept) {
                entities.concepts.push(concept);
            }
        });

        entities.totalCount = entities.persons.length + entities.places.length +
                             entities.orgs.length + entities.concepts.length;

        return entities;
    },

    /**
     * Get elements by tag name with namespace support
     */
    getElementsNS(xmlDoc, tagName) {
        // Try with namespace first
        let elements = xmlDoc.getElementsByTagNameNS(this.TEI_NAMESPACE, tagName);

        // Fallback to without namespace
        if (elements.length === 0) {
            elements = xmlDoc.getElementsByTagName(tagName);
        }

        return Array.from(elements);
    },

    /**
     * Get text content of first child element
     */
    getChildText(element, tagName) {
        const child = element.getElementsByTagNameNS(this.TEI_NAMESPACE, tagName)[0] ||
                     element.getElementsByTagName(tagName)[0];
        return child ? child.textContent.trim() : '';
    },

    /**
     * Extract person data
     */
    extractPerson(personEl, index) {
        const xmlId = personEl.getAttribute('xml:id') || `person_${index}`;

        // Extract persName (can be complex with forename/surname)
        const persNameEl = personEl.getElementsByTagNameNS(this.TEI_NAMESPACE, 'persName')[0] ||
                          personEl.getElementsByTagName('persName')[0];

        let name = '';
        if (persNameEl) {
            // Check for structured name
            const forename = this.getChildText(persNameEl, 'forename');
            const surname = this.getChildText(persNameEl, 'surname');

            if (forename || surname) {
                name = [forename, surname].filter(n => n).join(' ');
            } else {
                name = persNameEl.textContent.trim();
            }
        }

        if (!name) {
            Logger.warning('TEI', `Person ${xmlId} has no name, skipping`);
            return null;
        }

        // Check for existing Wikidata reference
        const existingRef = this.extractExistingRef(personEl);

        // Extract context for better matching
        const birth = this.getChildText(personEl, 'birth');
        const death = this.getChildText(personEl, 'death');
        const sex = this.getChildText(personEl, 'sex');

        return {
            id: Utils.generateId(),
            xmlId: xmlId,
            type: 'person',
            name: name,
            context: {
                birth: birth || null,
                death: death || null,
                sex: sex || null
            },
            existingRef: existingRef,
            element: personEl
        };
    },

    /**
     * Extract place data
     */
    extractPlace(placeEl, index) {
        const xmlId = placeEl.getAttribute('xml:id') || `place_${index}`;

        const placeNameEl = placeEl.getElementsByTagNameNS(this.TEI_NAMESPACE, 'placeName')[0] ||
                           placeEl.getElementsByTagName('placeName')[0];

        const name = placeNameEl ? placeNameEl.textContent.trim() : '';

        if (!name) {
            Logger.warning('TEI', `Place ${xmlId} has no name, skipping`);
            return null;
        }

        // Check for existing Wikidata reference
        const existingRef = this.extractExistingRef(placeEl);

        // Extract context
        const settlement = this.getChildText(placeEl, 'settlement');
        const region = this.getChildText(placeEl, 'region');
        const country = this.getChildText(placeEl, 'country');

        return {
            id: Utils.generateId(),
            xmlId: xmlId,
            type: 'place',
            name: name,
            context: {
                settlement: settlement || null,
                region: region || null,
                country: country || null
            },
            existingRef: existingRef,
            element: placeEl
        };
    },

    /**
     * Extract organization data
     */
    extractOrg(orgEl, index) {
        const xmlId = orgEl.getAttribute('xml:id') || `org_${index}`;

        const orgNameEl = orgEl.getElementsByTagNameNS(this.TEI_NAMESPACE, 'orgName')[0] ||
                         orgEl.getElementsByTagName('orgName')[0];

        const name = orgNameEl ? orgNameEl.textContent.trim() : '';

        if (!name) {
            Logger.warning('TEI', `Organization ${xmlId} has no name, skipping`);
            return null;
        }

        // Check for existing Wikidata reference
        const existingRef = this.extractExistingRef(orgEl);

        // Extract context
        const settlement = this.getChildText(orgEl, 'settlement');
        const region = this.getChildText(orgEl, 'region');
        const desc = this.getChildText(orgEl, 'desc');

        return {
            id: Utils.generateId(),
            xmlId: xmlId,
            type: 'org',
            name: name,
            context: {
                settlement: settlement || null,
                region: region || null,
                desc: desc || null
            },
            existingRef: existingRef,
            element: orgEl
        };
    },

    /**
     * Extract category/concept data from taxonomy
     */
    extractCategory(categoryEl, index) {
        const xmlId = categoryEl.getAttribute('xml:id') || `category_${index}`;

        // Extract term from catDesc > term
        const catDescEl = categoryEl.getElementsByTagNameNS(this.TEI_NAMESPACE, 'catDesc')[0] ||
                         categoryEl.getElementsByTagName('catDesc')[0];

        let name = '';
        if (catDescEl) {
            const termEl = catDescEl.getElementsByTagNameNS(this.TEI_NAMESPACE, 'term')[0] ||
                          catDescEl.getElementsByTagName('term')[0];
            name = termEl ? termEl.textContent.trim() : catDescEl.textContent.trim();
        }

        if (!name) {
            Logger.warning('TEI', `Category ${xmlId} has no term, skipping`);
            return null;
        }

        // Check for existing Wikidata reference
        const existingRef = this.extractExistingRef(categoryEl);

        // Also check term element for ref
        if (!existingRef && catDescEl) {
            const termEl = catDescEl.getElementsByTagNameNS(this.TEI_NAMESPACE, 'term')[0] ||
                          catDescEl.getElementsByTagName('term')[0];
            if (termEl) {
                const termRef = this.extractExistingRef(termEl);
                if (termRef) {
                    return {
                        id: Utils.generateId(),
                        xmlId: xmlId,
                        type: 'concept',
                        name: name,
                        context: {},
                        existingRef: termRef,
                        element: categoryEl,
                        refElement: termEl // Store where ref should be added
                    };
                }
            }
        }

        return {
            id: Utils.generateId(),
            xmlId: xmlId,
            type: 'concept',
            name: name,
            context: {},
            existingRef: existingRef,
            element: categoryEl
        };
    },

    /**
     * Extract existing Wikidata reference from element
     * Handles formats: @ref="wd:Q123", @ref="http://www.wikidata.org/entity/Q123"
     */
    extractExistingRef(element) {
        const ref = element.getAttribute('ref');
        if (!ref) return null;

        // Handle wd:Q123 format
        if (ref.startsWith('wd:') || ref.startsWith('wd:q')) {
            const qid = ref.replace(/^wd:/i, '').toUpperCase();
            return {
                id: qid,
                url: `http://www.wikidata.org/entity/${qid}`,
                source: 'existing'
            };
        }

        // Handle full URL format
        if (ref.includes('wikidata.org/entity/')) {
            const match = ref.match(/[Qq]\d+/);
            if (match) {
                return {
                    id: match[0].toUpperCase(),
                    url: ref,
                    source: 'existing'
                };
            }
        }

        return null;
    },

    /**
     * Export enriched TEI XML with @ref attributes added
     * @param {Array} items - Reconciliation items with selected candidates
     * @returns {string} Enriched TEI XML string
     */
    exportEnrichedTEI(items) {
        Logger.info('TEI', 'Creating enriched TEI XML');

        if (!this.parsedXML) {
            throw new Error('No TEI XML loaded');
        }

        // Clone the document to avoid modifying the original
        const enrichedDoc = this.parsedXML.cloneNode(true);

        // Add @ref attributes to matched elements
        items.forEach(item => {
            if (item.selectedCandidate && item.teiXmlId) {
                // Use wd:Q format for ref attribute
                const wikidataRef = `wd:${item.selectedCandidate.id}`;

                // Find the element by xml:id
                const xpath = `//*[@xml:id="${item.teiXmlId}"]`;
                const result = enrichedDoc.evaluate(
                    xpath,
                    enrichedDoc,
                    (prefix) => prefix === 'xml' ? 'http://www.w3.org/XML/1998/namespace' : this.TEI_NAMESPACE,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                );

                const element = result.singleNodeValue;
                if (element) {
                    // For categories, add @ref to <term> element if it exists
                    if (item.row && item.row.__tei_entity && item.row.__tei_entity.refElement) {
                        // Find the term element within this category
                        const catDescEl = element.getElementsByTagNameNS(this.TEI_NAMESPACE, 'catDesc')[0] ||
                                         element.getElementsByTagName('catDesc')[0];
                        if (catDescEl) {
                            const termEl = catDescEl.getElementsByTagNameNS(this.TEI_NAMESPACE, 'term')[0] ||
                                          catDescEl.getElementsByTagName('term')[0];
                            if (termEl) {
                                termEl.setAttribute('ref', wikidataRef);
                                Logger.info('TEI', `Added @ref to <term> in ${item.teiXmlId}: ${item.selectedCandidate.id}`);
                            }
                        }
                    } else {
                        // Add to main element (person, place, org)
                        element.setAttribute('ref', wikidataRef);
                        Logger.info('TEI', `Added @ref to ${item.teiXmlId}: ${item.selectedCandidate.id}`);
                    }
                }
            }
        });

        // Serialize back to string
        const serializer = new XMLSerializer();
        const xmlString = serializer.serializeToString(enrichedDoc);

        // Format nicely (preserve original formatting as much as possible)
        return this.formatXML(xmlString);
    },

    /**
     * Simple XML formatting (basic indentation)
     */
    formatXML(xml) {
        // For now, return as-is to preserve original formatting
        // TODO: Could add prettier XML formatting if needed
        return xml;
    },

    /**
     * Convert TEI entities to CSV-compatible format for reconciliation
     */
    entitiesToReconciliationFormat(entities, entityType) {
        let selectedEntities = [];

        switch(entityType) {
            case 'person':
                selectedEntities = entities.persons;
                break;
            case 'place':
                selectedEntities = entities.places;
                break;
            case 'org':
                selectedEntities = entities.orgs;
                break;
            case 'concept':
                selectedEntities = entities.concepts;
                break;
            case 'all':
                // Combine all entity types
                selectedEntities = [
                    ...entities.persons,
                    ...entities.places,
                    ...entities.orgs,
                    ...entities.concepts
                ];
                break;
            default:
                // Combine all if no specific type selected
                selectedEntities = [
                    ...entities.persons,
                    ...entities.places,
                    ...entities.orgs,
                    ...entities.concepts
                ];
        }

        // Convert to format expected by reconciliation module
        return {
            fileName: 'TEI XML',
            headers: ['name', 'type', 'context', 'existing_ref'],
            rows: selectedEntities.map(entity => ({
                name: entity.name,
                type: entity.type,
                context: JSON.stringify(entity.context),
                existing_ref: entity.existingRef ? entity.existingRef.id : '',
                __tei_entity: entity // Store original entity reference
            })),
            rowCount: selectedEntities.length,
            columnCount: 4,
            isTEI: true,
            originalEntities: selectedEntities
        };
    },

    /**
     * Clear parsed data
     */
    clear() {
        this.parsedXML = null;
        this.originalXMLString = null;
        Logger.info('TEI', 'Parser cleared');
    }
};

window.TEIParser = TEIParser;
Logger.success('TEI', 'TEI Parser module loaded');
